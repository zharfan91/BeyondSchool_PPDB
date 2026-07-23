import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/api-guard";
import { getOrCreateActiveTest } from "@/lib/test";

// Body: { orderedIds: string[] } — sets each question's `order` to its index.
export async function PATCH(request: NextRequest) {
  const guard = await requireRole(request, ADMIN_ROLES);
  if ("error" in guard) return guard.error;

  try {
    const test = await getOrCreateActiveTest();
    if (!test) {
      return NextResponse.json({ error: "Tidak ada periode aktif" }, { status: 400 });
    }

    const { orderedIds } = (await request.json()) as { orderedIds?: string[] };
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: "Daftar urutan kosong" }, { status: 400 });
    }

    // Only reorder questions that actually belong to the active test.
    const owned = await prisma.testQuestion.findMany({
      where: { testId: test.id, id: { in: orderedIds } },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((q) => q.id));

    await prisma.$transaction(
      orderedIds
        .filter((id) => ownedIds.has(id))
        .map((id, index) => prisma.testQuestion.update({ where: { id }, data: { order: index } }))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder questions:", error);
    return NextResponse.json({ error: "Gagal mengubah urutan soal" }, { status: 500 });
  }
}
