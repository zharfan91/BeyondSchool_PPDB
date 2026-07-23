import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/api-guard";
import { getOrCreateActiveTest } from "@/lib/test";

// Lists other periods' tests that have questions, as copy sources.
export async function GET(request: NextRequest) {
  const guard = await requireRole(request, ADMIN_ROLES);
  if ("error" in guard) return guard.error;

  try {
    const activeTest = await getOrCreateActiveTest();
    const tests = await prisma.test.findMany({
      where: activeTest ? { id: { not: activeTest.id } } : undefined,
      include: {
        academicPeriod: { select: { name: true } },
        _count: { select: { questions: true } },
      },
    });

    const sources = tests
      .filter((t) => t._count.questions > 0)
      .map((t) => ({ id: t.id, periodName: t.academicPeriod.name, questionCount: t._count.questions }));

    return NextResponse.json(sources);
  } catch (error) {
    console.error("Failed to list copy sources:", error);
    return NextResponse.json({ error: "Gagal memuat sumber salinan" }, { status: 500 });
  }
}

// Body: { fromTestId } — clones every question (+options/keys) into the active test.
export async function POST(request: NextRequest) {
  const guard = await requireRole(request, ADMIN_ROLES);
  if ("error" in guard) return guard.error;

  try {
    const test = await getOrCreateActiveTest();
    if (!test) {
      return NextResponse.json({ error: "Tidak ada periode pendaftaran yang sedang aktif" }, { status: 400 });
    }

    const { fromTestId } = (await request.json()) as { fromTestId?: string };
    if (!fromTestId || fromTestId === test.id) {
      return NextResponse.json({ error: "Sumber salinan tidak valid" }, { status: 400 });
    }

    const source = await prisma.testQuestion.findMany({
      where: { testId: fromTestId },
      include: { options: true },
      orderBy: { order: "asc" },
    });
    if (source.length === 0) {
      return NextResponse.json({ error: "Sumber tidak memiliki soal" }, { status: 400 });
    }

    const last = await prisma.testQuestion.findFirst({
      where: { testId: test.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    let nextOrder = last ? last.order + 1 : 0;

    await prisma.$transaction(
      source.map((q) =>
        prisma.testQuestion.create({
          data: {
            testId: test.id,
            type: q.type,
            question: q.question,
            points: q.points,
            order: nextOrder++,
            essayAnswerKey: q.essayAnswerKey,
            acceptedAnswers: q.acceptedAnswers ?? undefined,
            options: {
              create: q.options.map((o) => ({ label: o.label, text: o.text, isCorrect: o.isCorrect })),
            },
          },
        })
      )
    );

    return NextResponse.json({ success: true, copied: source.length });
  } catch (error) {
    console.error("Failed to copy questions:", error);
    return NextResponse.json({ error: "Gagal menyalin soal" }, { status: 500 });
  }
}
