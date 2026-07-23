import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicantService } from "@/services/applicant-service";
import { getOrCreateActiveTest, seededShuffle } from "@/lib/test";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await applicantService.findByUserId(session.user.id);
    const registration = applicant?.registration;

    if (!registration) {
      return NextResponse.json({ hasRegistration: false });
    }

    const test = await getOrCreateActiveTest();
    const attempt = await prisma.testAttempt.findUnique({
      where: { registrationId: registration.id },
      include: { answers: true },
    });

    // Test availability for a student who hasn't started yet.
    const now = new Date();
    const notYetOpen = test?.opensAt ? now < test.opensAt : false;
    const alreadyClosed = test?.closesAt ? now > test.closesAt : false;
    const eligible = registration.status !== "DRAFT";
    const available = !!test && test.isPublished && !notYetOpen && !alreadyClosed;

    // Load questions from whichever test the attempt belongs to (or the active
    // test if not started). Never leak answer keys / which option is correct.
    const testIdForQuestions = attempt?.testId ?? test?.id;
    const rawQuestions = testIdForQuestions
      ? await prisma.testQuestion.findMany({
          where: { testId: testIdForQuestions },
          select: {
            id: true,
            type: true,
            question: true,
            order: true,
            points: true,
            options: { select: { id: true, label: true, text: true } },
          },
          orderBy: { order: "asc" },
        })
      : [];

    // Apply the per-attempt persisted question order if present (shuffle).
    let questions = rawQuestions;
    if (attempt?.questionOrder && Array.isArray(attempt.questionOrder)) {
      const order = attempt.questionOrder as string[];
      const byId = new Map(rawQuestions.map((q) => [q.id, q]));
      questions = order.map((id) => byId.get(id)).filter((q): q is (typeof rawQuestions)[number] => !!q);
      // Include any question not in the persisted order (added after start) at the end.
      for (const q of rawQuestions) if (!order.includes(q.id)) questions.push(q);
    }

    // Stably shuffle each question's options per attempt when enabled.
    const ownerTest = attempt ? await prisma.test.findUnique({ where: { id: attempt.testId } }) : test;
    if (attempt && ownerTest?.shuffleOptions) {
      questions = questions.map((q) => ({ ...q, options: seededShuffle(q.options, attempt.id + q.id) }));
    }

    return NextResponse.json({
      hasRegistration: true,
      eligible,
      available,
      notYetOpen,
      alreadyClosed,
      test: test
        ? {
            title: test.title,
            description: test.description,
            durationMinutes: test.durationMinutes,
            opensAt: test.opensAt,
            closesAt: test.closesAt,
            isPublished: test.isPublished,
          }
        : null,
      questionCount: rawQuestions.length,
      questions,
      attempt: attempt
        ? {
            id: attempt.id,
            status: attempt.status,
            startedAt: attempt.startedAt,
            expiresAt: attempt.expiresAt,
            submittedAt: attempt.submittedAt,
            totalScore: attempt.totalScore,
            maxScore: attempt.maxScore,
          }
        : null,
      answers:
        attempt?.answers.map((a) => ({
          questionId: a.questionId,
          selectedOptionId: a.selectedOptionId,
          essayAnswer: a.essayAnswer,
          pointsAwarded: attempt.status === "GRADED" ? a.pointsAwarded : null,
          feedback: attempt.status === "GRADED" ? a.feedback : null,
        })) ?? [],
    });
  } catch (error) {
    console.error("Failed to fetch test state:", error);
    return NextResponse.json({ error: "Gagal memuat data tes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await applicantService.findByUserId(session.user.id);
    const registration = applicant?.registration;
    if (!registration) {
      return NextResponse.json({ error: "Registrasi tidak ditemukan" }, { status: 400 });
    }

    // Eligibility: registration must be submitted (not still a draft).
    if (registration.status === "DRAFT") {
      return NextResponse.json(
        { error: "Selesaikan dan kirim formulir pendaftaran Anda terlebih dahulu sebelum mengikuti tes." },
        { status: 400 }
      );
    }

    const existing = await prisma.testAttempt.findUnique({ where: { registrationId: registration.id } });
    if (existing) {
      return NextResponse.json({ error: "Anda sudah memulai tes ini" }, { status: 400 });
    }

    const test = await getOrCreateActiveTest();
    if (!test) {
      return NextResponse.json({ error: "Tidak ada periode pendaftaran yang sedang aktif" }, { status: 400 });
    }
    if (!test.isPublished) {
      return NextResponse.json({ error: "Tes belum dibuka oleh panitia" }, { status: 400 });
    }

    const now = new Date();
    if (test.opensAt && now < test.opensAt) {
      return NextResponse.json({ error: "Tes belum dibuka. Silakan cek jadwal." }, { status: 400 });
    }
    if (test.closesAt && now > test.closesAt) {
      return NextResponse.json({ error: "Waktu tes sudah ditutup." }, { status: 400 });
    }

    const questions = await prisma.testQuestion.findMany({
      where: { testId: test.id },
      select: { id: true, order: true },
      orderBy: { order: "asc" },
    });
    if (questions.length === 0) {
      return NextResponse.json({ error: "Soal tes belum disiapkan oleh panitia" }, { status: 400 });
    }

    const orderedIds = test.shuffleQuestions ? shuffle(questions.map((q) => q.id)) : questions.map((q) => q.id);
    const expiresAt = test.durationMinutes
      ? new Date(now.getTime() + test.durationMinutes * 60_000)
      : null;

    const attempt = await prisma.testAttempt.create({
      data: {
        registrationId: registration.id,
        testId: test.id,
        expiresAt,
        questionOrder: orderedIds,
      },
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("Failed to start test attempt:", error);
    return NextResponse.json({ error: "Gagal memulai tes" }, { status: 500 });
  }
}
