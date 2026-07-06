import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { applicantService } from "@/services/applicant-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== ROLES.ADMIN && role !== ROLES.PRINCIPAL && role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [applicants, payments, programs] = await Promise.all([
      applicantService.list(),
      prisma.payment.findMany({
        include: {
          paymentType: true,
          registration: { include: { applicant: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.program.findMany({
        include: {
          registrations: { include: { selectionResults: true } },
        },
      }),
    ]);

    const paymentsMapped = payments.map((p) => ({
      name: p.registration.applicant.firstName,
      invoice: p.invoiceNumber,
      paymentType: p.paymentType.name,
      amount: Number(p.amount),
      status: p.status,
      date: p.createdAt,
    }));

    const selectionByProgram = programs.map((program) => {
      const results = program.registrations.flatMap((r) => r.selectionResults);
      return {
        program: program.name,
        passed: results.filter((r) => r.status === "PASSED").length,
        waitlist: results.filter((r) => r.status === "WAITLIST").length,
        rejected: results.filter((r) => r.status === "REJECTED").length,
        pending: results.filter((r) => r.status === "PENDING").length,
      };
    });

    return NextResponse.json({ applicants, payments: paymentsMapped, selectionByProgram });
  } catch (error) {
    console.error("Failed to fetch report data:", error);
    return NextResponse.json({ error: "Gagal memuat data laporan" }, { status: 500 });
  }
}
