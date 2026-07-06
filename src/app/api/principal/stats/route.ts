import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { selectionService } from "@/services/selection-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== ROLES.PRINCIPAL && role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalApplicants, selectionSummary, quotas, revenue, awaitingDecision] = await Promise.all([
      prisma.applicant.count(),
      selectionService.getSummary(),
      prisma.programQuota.findMany({ include: { program: true } }),
      prisma.payment.aggregate({
        where: { status: { in: ["PAID", "VERIFIED"] } },
        _sum: { amount: true },
      }),
      prisma.registration.count({ where: { status: "VERIFIED" } }),
    ]);

    const passed = selectionSummary.PASSED ?? 0;
    const totalQuota = quotas.reduce((sum, q) => sum + q.totalQuota, 0);
    const totalFilled = quotas.reduce((sum, q) => sum + q.filledQuota, 0);
    const realizationPct = totalQuota > 0 ? Math.round((totalFilled / totalQuota) * 100) : 0;

    const programSummary = quotas.map((q) => ({
      program: q.program.name,
      filled: q.filledQuota,
      total: q.totalQuota,
    }));

    return NextResponse.json({
      totalApplicants,
      passed,
      realizationPct,
      totalRevenue: Number(revenue._sum.amount ?? 0),
      programSummary,
      awaitingDecision,
    });
  } catch (error) {
    console.error("Failed to fetch principal stats:", error);
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 });
  }
}
