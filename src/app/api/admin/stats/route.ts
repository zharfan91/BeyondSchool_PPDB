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

    const [totalApplicants, pendingVerification, revenue, quotas, recentRegistrations] =
      await Promise.all([
        prisma.applicant.count(),
        prisma.registration.count({ where: { status: "SUBMITTED" } }),
        prisma.payment.aggregate({
          where: { status: { in: ["PAID", "VERIFIED"] } },
          _sum: { amount: true },
        }),
        prisma.programQuota.findMany({ include: { program: true } }),
        prisma.registration.findMany({
          take: 5,
          orderBy: { updatedAt: "desc" },
          include: { applicant: true, program: true },
        }),
      ]);

    const totalQuota = quotas.reduce((sum, q) => sum + q.totalQuota, 0);
    const totalFilled = quotas.reduce((sum, q) => sum + q.filledQuota, 0);
    const capacityPct = totalQuota > 0 ? Math.round((totalFilled / totalQuota) * 100) : 0;

    const programDistribution = quotas.map((q) => ({
      program: q.program.name,
      total: q.totalQuota,
      filled: q.filledQuota,
    }));

    const recent = recentRegistrations.map((r) => ({
      name: r.applicant.firstName,
      registrationNumber: r.applicant.registrationNumber ?? "-",
      status: r.status,
    }));

    return NextResponse.json({
      totalApplicants,
      pendingVerification,
      totalRevenue: Number(revenue._sum.amount ?? 0),
      capacityPct,
      programDistribution,
      recent,
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: "Gagal memuat statistik admin" },
      { status: 500 }
    );
  }
}
