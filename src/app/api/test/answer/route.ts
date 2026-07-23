import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicantService } from "@/services/applicant-service";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, selectedOptionId, essayAnswer } = body as {
      questionId?: string;
      selectedOptionId?: string | null;
      essayAnswer?: string | null;
    };

    if (!questionId) {
      return NextResponse.json({ error: "questionId diperlukan" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Tes ini sudah dikirim dan tidak dapat diubah" }, { status: 400 });
    }
    if (attempt.expiresAt && new Date() > attempt.expiresAt) {
      return NextResponse.json({ error: "Waktu pengerjaan tes sudah habis" }, { status: 400 });
    }

    const question = await prisma.testQuestion.findUnique({ where: { id: questionId } });
    if (!question || question.testId !== attempt.testId) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    // MULTIPLE_CHOICE and TRUE_FALSE are option-based; SHORT_ANSWER and ESSAY
    // are free-text.
    const optionBased = question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE";
    const data = optionBased
      ? { selectedOptionId: selectedOptionId ?? null, essayAnswer: null }
      : { essayAnswer: essayAnswer ?? null, selectedOptionId: null };

    await prisma.testAnswer.upsert({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
      update: data,
      create: { attemptId: attempt.id, questionId, ...data },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save test answer:", error);
    return NextResponse.json({ error: "Gagal menyimpan jawaban" }, { status: 500 });
  }
}
