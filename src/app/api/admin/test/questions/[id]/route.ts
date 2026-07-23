import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/api-guard";
import type { Prisma } from "@prisma/client";

interface OptionInput {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface EditInput {
  question?: string;
  points?: number;
  order?: number;
  options?: OptionInput[];
  essayAnswerKey?: string;
  acceptedAnswers?: string[];
  correctBool?: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(request, ADMIN_ROLES);
  if ("error" in guard) return guard.error;

  try {
    const { id } = await params;
    const existing = await prisma.testQuestion.findUnique({ where: { id }, include: { answers: true } });
    if (!existing) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }
    if (existing.answers.length > 0) {
      return NextResponse.json(
        { error: "Soal ini sudah dijawab oleh pendaftar dan tidak dapat diubah lagi. Buat soal baru jika perlu revisi." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as EditInput;
    const { question, points, order } = body;
    const type = existing.type;

    // Per-type validation for the fields that can be edited.
    if (type === "MULTIPLE_CHOICE" && body.options) {
      const opts = body.options.filter((o) => o.text.trim());
      if (opts.length < 2 || !opts.some((o) => o.isCorrect)) {
        return NextResponse.json(
          { error: "Pilihan ganda butuh minimal 2 opsi dengan satu kunci jawaban benar" },
          { status: 400 }
        );
      }
    }
    if (type === "SHORT_ANSWER" && body.acceptedAnswers) {
      const accepted = body.acceptedAnswers.map((a) => a.trim()).filter(Boolean);
      if (accepted.length === 0) {
        return NextResponse.json({ error: "Isi minimal satu jawaban yang diterima" }, { status: 400 });
      }
    }

    const rebuildOptions =
      (type === "MULTIPLE_CHOICE" && body.options) || (type === "TRUE_FALSE" && typeof body.correctBool === "boolean");

    const data: Prisma.TestQuestionUpdateInput = {
      question: question?.trim() ?? existing.question,
      points: points && points > 0 ? Math.floor(points) : existing.points,
      order: order ?? existing.order,
    };
    if (type === "ESSAY") {
      data.essayAnswerKey = body.essayAnswerKey?.trim() ?? existing.essayAnswerKey;
    }
    if (type === "SHORT_ANSWER" && body.acceptedAnswers) {
      data.acceptedAnswers = body.acceptedAnswers.map((a) => a.trim()).filter(Boolean);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (rebuildOptions) {
        await tx.testQuestionOption.deleteMany({ where: { questionId: id } });
        if (type === "MULTIPLE_CHOICE" && body.options) {
          data.options = {
            create: body.options
              .filter((o) => o.text.trim())
              .map((o) => ({ label: o.label, text: o.text.trim(), isCorrect: !!o.isCorrect })),
          };
        } else if (type === "TRUE_FALSE") {
          data.options = {
            create: [
              { label: "B", text: "Benar", isCorrect: body.correctBool === true },
              { label: "S", text: "Salah", isCorrect: body.correctBool === false },
            ],
          };
        }
      }
      return tx.testQuestion.update({ where: { id }, data, include: { options: true } });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update test question:", error);
    return NextResponse.json({ error: "Gagal memperbarui soal" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(request, ADMIN_ROLES);
  if ("error" in guard) return guard.error;

  try {
    const { id } = await params;
    const existing = await prisma.testQuestion.findUnique({ where: { id }, include: { answers: true } });
    if (!existing) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }
    if (existing.answers.length > 0) {
      return NextResponse.json(
        { error: "Soal ini sudah dijawab oleh pendaftar dan tidak dapat dihapus." },
        { status: 400 }
      );
    }

    await prisma.testQuestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete test question:", error);
    return NextResponse.json({ error: "Gagal menghapus soal" }, { status: 500 });
  }
}
