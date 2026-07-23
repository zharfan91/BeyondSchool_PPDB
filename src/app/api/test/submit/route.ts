import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicantService } from "@/services/applicant-service";
import { finalizeAttemptScore } from "@/lib/test-scoring";
import { autoGradePoints } from "@/lib/test";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const auto = (body as { auto?: boolean }).auto === true; // auto-submit on timeout

    const applicant = await applicantService.findByUserId(session.user.id);
    const registration = applicant?.registration;
    if (!registration) {
      return NextResponse.json({ error: "Registrasi tidak ditemukan" }, { status: 400 });
    }

    const attempt = await prisma.testAttempt.findUnique({ where: { registrationId: registration.id } });
    if (!attempt) {
      return NextResponse.json({ error: "Anda belum memulai tes" }, { status: 400 });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Tes ini sudah dikirim sebelumnya" }, { status: 400 });
    }

    const [questions, answers] = await Promise.all([
      prisma.testQuestion.findMany({
        where: { testId: attempt.testId },
        include: { options: true },
      }),
      prisma.testAnswer.findMany({ where: { attemptId: attempt.id } }),
    ]);

    // On manual submit, require every question answered. On auto-submit
    // (time ran out), submit whatever exists — unanswered = 0 points.
    if (!auto) {
      const answeredIds = new Set(
        answers
          .filter((a) => a.selectedOptionId || (a.essayAnswer && a.essayAnswer.trim()))
          .map((a) => a.questionId)
      );
      const unanswered = questions.filter((q) => !answeredIds.has(q.id));
      if (unanswered.length > 0) {
        return NextResponse.json(
          { error: `Masih ada ${unanswered.length} soal yang belum dijawab` },
          { status: 400 }
        );
      }
    }

    // Auto-grade every objective question (MC / true-false / short-answer).
    // Ensure a row exists for each (auto-submit may have some unanswered).
    await Promise.all(
      questions.map(async (q) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const points = autoGradePoints(q, {
          selectedOptionId: answer?.selectedOptionId ?? null,
          essayAnswer: answer?.essayAnswer ?? null,
        });
        if (points === null) return; // ESSAY: leave for manual grading
        if (answer) {
          await prisma.testAnswer.update({ where: { id: answer.id }, data: { pointsAwarded: points } });
        } else {
          await prisma.testAnswer.create({
            data: { attemptId: attempt.id, questionId: q.id, pointsAwarded: points },
          });
        }
      })
    );

    const hasEssay = questions.some((q) => q.type === "ESSAY");

    if (hasEssay) {
      await prisma.testAttempt.update({
        where: { id: attempt.id },
        data: { status: "SUBMITTED", submittedAt: new Date() },
      });
      return NextResponse.json({ success: true, status: "SUBMITTED" });
    }

    await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: { submittedAt: new Date() },
    });
    const result = await finalizeAttemptScore(attempt.id);
    return NextResponse.json({ success: true, status: "GRADED", ...result });
  } catch (error) {
    console.error("Failed to submit test:", error);
    return NextResponse.json({ error: "Gagal mengirim tes" }, { status: 500 });
  }
}
