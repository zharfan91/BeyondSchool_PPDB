import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/api-guard";
import { getOrCreateActiveTest, buildQuestionData, type QuestionInput } from "@/lib/test";

export async function POST(request: NextRequest) {
  const guard = await requireRole(request, ADMIN_ROLES);
  if ("error" in guard) return guard.error;

  try {
    const test = await getOrCreateActiveTest();
    if (!test) {
      return NextResponse.json({ error: "Tidak ada periode pendaftaran yang sedang aktif" }, { status: 400 });
    }

    const input = (await request.json()) as QuestionInput;
    const built = buildQuestionData(input);
    if ("error" in built) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }

    // Append at the end unless an explicit order is given.
    const last = await prisma.testQuestion.findFirst({
      where: { testId: test.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const order = input.order ?? (last ? last.order + 1 : 0);

    const created = await prisma.testQuestion.create({
      data: { ...built.data, order, test: { connect: { id: test.id } } },
      include: { options: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create test question:", error);
    return NextResponse.json({ error: "Gagal membuat soal" }, { status: 500 });
  }
}
