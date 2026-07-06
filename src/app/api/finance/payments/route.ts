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

    const payments = await prisma.payment.findMany({
      include: {
        paymentType: true,
        registration: {
          include: { applicant: true, program: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = payments.map((p) => ({
      id: p.id,
      name: p.registration.applicant.firstName,
      invoice: p.invoiceNumber,
      program: p.registration.program.name,
      amount: Number(p.amount),
      status: p.status,
      date: p.createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Failed to fetch finance payments:", error);
    return NextResponse.json({ error: "Gagal memuat data pembayaran" }, { status: 500 });
  }
}
