import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const attempts = await prisma.testAttempt.findMany({
      where: { status: "SUBMITTED" },
      include: {
        registration: {
          include: { applicant: true },
        },
        answers: {
          where: { question: { type: "ESSAY" } },
          include: { question: true },
        },
      },
      orderBy: { submittedAt: "asc" },
    });

    const mapped = attempts.map((a) => ({
      attemptId: a.id,
      applicantName: a.registration.applicant.firstName,
      registrationNumber: a.registration.applicant.registrationNumber,
      submittedAt: a.submittedAt,
      essayAnswers: a.answers.map((ans) => ({
        answerId: ans.id,
        question: ans.question.question,
        answerKey: ans.question.essayAnswerKey,
        maxPoints: ans.question.points,
        essayAnswer: ans.essayAnswer,
        pointsAwarded: ans.pointsAwarded,
        feedback: ans.feedback,
      })),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Failed to fetch grading queue:", error);
    return NextResponse.json({ error: "Gagal memuat antrian penilaian" }, { status: 500 });
  }
}
