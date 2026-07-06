import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

const WAITLIST_RATIO = 0.2;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== ROLES.STAFF && role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const activePeriod = await prisma.academicPeriod.findFirst({ where: { isActive: true } });
    if (!activePeriod) {
      return NextResponse.json({ error: "Tidak ada periode pendaftaran yang sedang aktif" }, { status: 400 });
    }

    const programs = await prisma.program.findMany({
      where: { academicPeriodId: activePeriod.id },
      include: {
        programQuotas: { where: { academicPeriodId: activePeriod.id } },
        registrations: {
          where: { status: "VERIFIED" },
          include: { selectionResults: true },
        },
      },
    });

    let passed = 0;
    let waitlisted = 0;
    let rejected = 0;

    for (const program of programs) {
      const totalQuota = program.programQuotas.reduce((sum, q) => sum + q.totalQuota, 0);
      if (totalQuota === 0) continue;

      const alreadyPassed = program.registrations.filter(
        (r) => r.selectionResults[0]?.status === "PASSED"
      ).length;

      const candidates = program.registrations.filter(
        (r) => !r.selectionResults[0] || r.selectionResults[0].status === "PENDING"
      );

      candidates.sort((a, b) => {
        const scoreA = Number(a.selectionResults[0]?.score ?? 0);
        const scoreB = Number(b.selectionResults[0]?.score ?? 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        const dateA = (a.submittedAt ?? a.createdAt).getTime();
        const dateB = (b.submittedAt ?? b.createdAt).getTime();
        return dateA - dateB;
      });

      const remainingCapacity = Math.max(totalQuota - alreadyPassed, 0);
      const waitlistCapacity = Math.ceil(totalQuota * WAITLIST_RATIO);

      for (let i = 0; i < candidates.length; i++) {
        const registration = candidates[i];
        const existingResult = registration.selectionResults[0];
        const decision = i < remainingCapacity ? "PASSED" : i < remainingCapacity + waitlistCapacity ? "WAITLIST" : "REJECTED";

        if (existingResult) {
          await prisma.selectionResult.update({
            where: { id: existingResult.id },
            data: { status: decision, decidedBy: session.user.id, decidedAt: new Date() },
          });
        } else {
          await prisma.selectionResult.create({
            data: {
              registrationId: registration.id,
              status: decision,
              score: 0,
              decidedBy: session.user.id,
              decidedAt: new Date(),
            },
          });
        }

        if (decision === "PASSED") {
          await prisma.registration.update({
            where: { id: registration.id },
            data: { status: "COMPLETED" },
          });
          passed++;
        } else if (decision === "WAITLIST") {
          waitlisted++;
        } else {
          rejected++;
        }
      }
    }

    return NextResponse.json({ passed, waitlisted, rejected });
  } catch (error) {
    console.error("Failed to process selection:", error);
    return NextResponse.json({ error: "Gagal memproses seleksi" }, { status: 500 });
  }
}
