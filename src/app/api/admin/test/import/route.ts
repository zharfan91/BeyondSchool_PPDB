import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/api-guard";
import { getOrCreateActiveTest, buildQuestionData, type QuestionInput } from "@/lib/test";
import type { Prisma } from "@prisma/client";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

/**
 * Bulk-import multiple-choice questions from pasted spreadsheet rows.
 * Each line, tab- or pipe-delimited:
 *   question | optA | optB | optC | optD | correctLetter | points
 * Trailing blank option columns are ignored. correctLetter and points are the
 * last two non-empty-aware columns; points defaults to 1.
 */
export async function POST(request: NextRequest) {
  const guard = await requireRole(request, ADMIN_ROLES);
  if ("error" in guard) return guard.error;

  try {
    const test = await getOrCreateActiveTest();
    if (!test) {
      return NextResponse.json({ error: "Tidak ada periode pendaftaran yang sedang aktif" }, { status: 400 });
    }

    const { tsv } = (await request.json()) as { tsv?: string };
    if (!tsv || !tsv.trim()) {
      return NextResponse.json({ error: "Data impor kosong" }, { status: 400 });
    }

    const lines = tsv
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const errors: string[] = [];
    const payloads: QuestionInput[] = [];

    lines.forEach((line, i) => {
      const cols = line.split(/\t|\|/).map((c) => c.trim());
      if (cols.length < 4) {
        errors.push(`Baris ${i + 1}: kolom kurang (butuh minimal pertanyaan, 2 opsi, kunci)`);
        return;
      }
      const questionText = cols[0];
      const points = Number(cols[cols.length - 1]);
      const hasPoints = !Number.isNaN(points) && cols[cols.length - 1] !== "";
      const correctLetter = (hasPoints ? cols[cols.length - 2] : cols[cols.length - 1]).toUpperCase();
      const optionEnd = hasPoints ? cols.length - 2 : cols.length - 1;
      const optionTexts = cols.slice(1, optionEnd).filter(Boolean);

      const correctIndex = OPTION_LABELS.indexOf(correctLetter);
      if (correctIndex < 0 || correctIndex >= optionTexts.length) {
        errors.push(`Baris ${i + 1}: kunci jawaban "${correctLetter}" tidak valid`);
        return;
      }

      payloads.push({
        type: "MULTIPLE_CHOICE",
        question: questionText,
        points: hasPoints ? points : 1,
        options: optionTexts.map((text, idx) => ({
          label: OPTION_LABELS[idx],
          text,
          isCorrect: idx === correctIndex,
        })),
      });
    });

    if (payloads.length === 0) {
      return NextResponse.json({ error: "Tidak ada baris valid untuk diimpor", errors }, { status: 400 });
    }

    // Validate all rows before writing any.
    const datas: Omit<Prisma.TestQuestionCreateInput, "test" | "order">[] = [];
    const buildErrors: string[] = [];
    for (const p of payloads) {
      const built = buildQuestionData(p);
      if ("error" in built) buildErrors.push(built.error);
      else datas.push(built.data);
    }
    if (buildErrors.length > 0) {
      return NextResponse.json(
        { error: "Sebagian baris tidak valid", errors: [...errors, ...buildErrors] },
        { status: 400 }
      );
    }

    const last = await prisma.testQuestion.findFirst({
      where: { testId: test.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    let nextOrder = last ? last.order + 1 : 0;

    await prisma.$transaction(
      datas.map((data) =>
        prisma.testQuestion.create({
          data: { ...data, order: nextOrder++, test: { connect: { id: test.id } } },
        })
      )
    );

    return NextResponse.json({ success: true, imported: datas.length, skipped: errors });
  } catch (error) {
    console.error("Failed to import questions:", error);
    return NextResponse.json({ error: "Gagal mengimpor soal" }, { status: 500 });
  }
}
