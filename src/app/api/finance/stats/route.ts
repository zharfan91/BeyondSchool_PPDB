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
    if (role !== ROLES.FINANCE && role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalIncome, paidCount, pendingCount, allCount] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: { in: ["PAID", "VERIFIED"] } },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: { in: ["PAID", "VERIFIED"] } } }),
      prisma.payment.count({ where: { status: { in: ["PENDING", "WAITING_PAYMENT"] } } }),
      prisma.payment.count(),
    ]);

    const targetPct = allCount > 0 ? Math.round((paidCount / allCount) * 100) : 0;

    return NextResponse.json({
      totalIncome: Number(totalIncome._sum.amount ?? 0),
      paidCount,
      pendingCount,
      targetPct,
    });
  } catch (error) {
    console.error("Failed to fetch finance stats:", error);
    return NextResponse.json({ error: "Gagal memuat statistik keuangan" }, { status: 500 });
  }
}
