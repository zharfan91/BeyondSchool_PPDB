import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/api-guard";
import { getOrCreateActiveTest } from "@/lib/test";

// GET: full test config + its questions (for the active period).
export async function GET(request: NextRequest) {
  const guard = await requireRole(request, ADMIN_ROLES);
  if ("error" in guard) return guard.error;

  try {
    const test = await getOrCreateActiveTest();
    if (!test) {
      return NextResponse.json({ test: null, activePeriod: null, questions: [] });
    }

    const [period, questions, attemptCount] = await Promise.all([
      prisma.academicPeriod.findUnique({ where: { id: test.academicPeriodId }, select: { id: true, name: true } }),
      prisma.testQuestion.findMany({
        where: { testId: test.id },
        include: { options: true },
        orderBy: { order: "asc" },
      }),
      prisma.testAttempt.count({ where: { testId: test.id } }),
    ]);

    return NextResponse.json({ test, activePeriod: period, questions, attemptCount });
  } catch (error) {
    console.error("Failed to fetch test:", error);
    return NextResponse.json({ error: "Gagal memuat tes" }, { status: 500 });
  }
}

// PATCH: update test-level config.
export async function PATCH(request: NextRequest) {
  const guard = await requireRole(request, ADMIN_ROLES);
  if ("error" in guard) return guard.error;

  try {
    const test = await getOrCreateActiveTest();
    if (!test) {
      return NextResponse.json({ error: "Tidak ada periode pendaftaran yang sedang aktif" }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      description,
      isPublished,
      durationMinutes,
      opensAt,
      closesAt,
      shuffleQuestions,
      shuffleOptions,
      selectionWeight,
    } = body as {
      title?: string;
      description?: string | null;
      isPublished?: boolean;
      durationMinutes?: number | null;
      opensAt?: string | null;
      closesAt?: string | null;
      shuffleQuestions?: boolean;
      shuffleOptions?: boolean;
      selectionWeight?: number;
    };

    // Guard against publishing an empty test.
    if (isPublished === true) {
      const questionCount = await prisma.testQuestion.count({ where: { testId: test.id } });
      if (questionCount === 0) {
        return NextResponse.json(
          { error: "Tidak dapat menerbitkan tes tanpa soal. Tambahkan minimal satu soal dulu." },
          { status: 400 }
        );
      }
    }

    if (opensAt && closesAt && new Date(opensAt) >= new Date(closesAt)) {
      return NextResponse.json({ error: "Waktu tutup harus setelah waktu buka" }, { status: 400 });
    }

    const updated = await prisma.test.update({
      where: { id: test.id },
      data: {
        title: title?.trim() || undefined,
        description: description !== undefined ? description : undefined,
        isPublished: typeof isPublished === "boolean" ? isPublished : undefined,
        durationMinutes:
          durationMinutes === null ? null : durationMinutes && durationMinutes > 0 ? Math.floor(durationMinutes) : undefined,
        opensAt: opensAt === null ? null : opensAt ? new Date(opensAt) : undefined,
        closesAt: closesAt === null ? null : closesAt ? new Date(closesAt) : undefined,
        shuffleQuestions: typeof shuffleQuestions === "boolean" ? shuffleQuestions : undefined,
        shuffleOptions: typeof shuffleOptions === "boolean" ? shuffleOptions : undefined,
        selectionWeight:
          selectionWeight !== undefined && selectionWeight >= 0 ? selectionWeight : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update test config:", error);
    return NextResponse.json({ error: "Gagal memperbarui konfigurasi tes" }, { status: 500 });
  }
}
