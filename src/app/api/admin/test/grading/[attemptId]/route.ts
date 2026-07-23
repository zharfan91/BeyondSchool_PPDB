import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { finalizeAttemptScore } from "@/lib/test-scoring";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { attemptId } = await params;
    const body = await request.json();
    const { grades } = body as { grades?: { answerId: string; points: number; feedback?: string }[] };

    if (!grades || grades.length === 0) {
      return NextResponse.json({ error: "Data penilaian kosong" }, { status: 400 });
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: { answers: { include: { question: true } } },
    });
    if (!attempt) {
      return NextResponse.json({ error: "Sesi tes tidak ditemukan" }, { status: 404 });
    }
    if (attempt.status !== "SUBMITTED") {
      return NextResponse.json({ error: "Sesi tes ini tidak sedang menunggu penilaian" }, { status: 400 });
    }

    for (const grade of grades) {
      const answer = attempt.answers.find((a) => a.id === grade.answerId);
      if (!answer || answer.question.type !== "ESSAY") continue;
      const clampedPoints = Math.max(0, Math.min(grade.points, answer.question.points));
      await prisma.testAnswer.update({
        where: { id: grade.answerId },
        data: {
          pointsAwarded: clampedPoints,
          feedback: grade.feedback ?? null,
          gradedBy: session.user.id,
          gradedAt: new Date(),
        },
      });
    }

    const stillUngraded = await prisma.testAnswer.count({
      where: { attemptId, pointsAwarded: null },
    });

    if (stillUngraded === 0) {
      const result = await finalizeAttemptScore(attemptId);
      return NextResponse.json({ success: true, graded: true, ...result });
    }

    return NextResponse.json({ success: true, graded: false });
  } catch (error) {
    console.error("Failed to save grades:", error);
    return NextResponse.json({ error: "Gagal menyimpan penilaian" }, { status: 500 });
  }
}
