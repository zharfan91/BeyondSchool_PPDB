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
    if (role !== ROLES.STAFF && role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [summary, quotas] = await Promise.all([
      selectionService.getSummary(),
      prisma.programQuota.findMany({
        include: {
          program: {
            include: {
              registrations: { include: { selectionResults: true } },
            },
          },
        },
      }),
    ]);

    const totalParticipants = await prisma.registration.count();

    const perProgram = quotas.map((q) => {
      const results = q.program.registrations.flatMap((r) => r.selectionResults);
      return {
        program: q.program.name,
        total: q.totalQuota,
        passed: results.filter((r) => r.status === "PASSED").length,
        waitlist: results.filter((r) => r.status === "WAITLIST").length,
        rejected: results.filter((r) => r.status === "REJECTED").length,
      };
    });

    return NextResponse.json({
      totalParticipants,
      passed: summary.PASSED ?? 0,
      waitlist: summary.WAITLIST ?? 0,
      rejected: summary.REJECTED ?? 0,
      perProgram,
    });
  } catch (error) {
    console.error("Failed to fetch selection stats:", error);
    return NextResponse.json({ error: "Gagal memuat statistik seleksi" }, { status: 500 });
  }
}
