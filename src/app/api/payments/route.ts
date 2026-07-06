import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicantService } from "@/services/applicant-service";
import { paymentService } from "@/services/payment-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentTypes = await prisma.paymentType.findMany({
      where: { isActive: true },
    });

    const applicant = await applicantService.findByUserId(session.user.id);
    const registration = applicant?.registration;

    if (!registration) {
      return NextResponse.json({ registrationId: null, payments: [], paymentTypes });
    }

    const payments = await paymentService.findByRegistration(registration.id);

    return NextResponse.json({ registrationId: registration.id, payments, paymentTypes });
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pembayaran" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentTypeId } = body as { paymentTypeId?: string };

    if (!paymentTypeId) {
      return NextResponse.json({ error: "Jenis pembayaran diperlukan" }, { status: 400 });
    }

    const applicant = await applicantService.findByUserId(session.user.id);
    const registration = applicant?.registration;

    if (!registration) {
      return NextResponse.json({ error: "Registrasi tidak ditemukan" }, { status: 400 });
    }

    const existing = registration.payments.find((p) => p.paymentTypeId === paymentTypeId);
    if (existing) {
      return NextResponse.json(existing);
    }

    const paymentType = await prisma.paymentType.findUnique({ where: { id: paymentTypeId } });
    if (!paymentType) {
      return NextResponse.json({ error: "Jenis pembayaran tidak ditemukan" }, { status: 404 });
    }

    const created = await paymentService.create({
      registrationId: registration.id,
      paymentTypeId,
      amount: Number(paymentType.amount),
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Failed to create payment:", error);
    return NextResponse.json(
      { error: "Gagal membuat tagihan pembayaran" },
      { status: 500 }
    );
  }
}
