import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicantService } from "@/services/applicant-service";
import { paymentService } from "@/services/payment-service";
import { createSnapTransaction, isSimulationMode } from "@/lib/midtrans";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentTypes = await prisma.paymentType.findMany({
      where: { isActive: true },
    });
    const simulation = isSimulationMode();

    const applicant = await applicantService.findByUserId(session.user.id);
    const registration = applicant?.registration;

    if (!registration) {
      return NextResponse.json({ registrationId: null, payments: [], paymentTypes, simulation });
    }

    const payments = await paymentService.findByRegistration(registration.id);

    return NextResponse.json({ registrationId: registration.id, payments, paymentTypes, simulation });
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pembayaran" },
      { status: 500 }
    );
  }
}

// Initiates payment: ensures a Payment row exists for the fee, then either
// creates a real Midtrans Snap transaction (returns a token for the popup) or,
// in simulation mode, marks it awaiting a simulated outcome.
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

    const paymentType = await prisma.paymentType.findUnique({ where: { id: paymentTypeId } });
    if (!paymentType) {
      return NextResponse.json({ error: "Jenis pembayaran tidak ditemukan" }, { status: 404 });
    }

    // Reuse the existing Payment row for this fee, or create one.
    let payment = registration.payments.find((p) => p.paymentTypeId === paymentTypeId) ?? null;
    if (payment && (payment.status === "VERIFIED" || payment.status === "PAID")) {
      return NextResponse.json({ error: "Pembayaran ini sudah lunas." }, { status: 400 });
    }
    if (!payment) {
      payment = await paymentService.create({
        registrationId: registration.id,
        paymentTypeId,
        amount: Number(paymentType.amount),
      });
    }

    // Fresh order id per attempt so an abandoned/expired prior attempt never
    // collides with Midtrans's "order_id already used" rule.
    const gatewayOrderId = `${payment.invoiceNumber}-${Date.now()}`.replace(/[^a-zA-Z0-9-]/g, "-");

    // ── Simulation mode (no Midtrans account): skip the real Snap call. ──
    if (isSimulationMode()) {
      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayOrderId, snapToken: null, paymentUrl: null, status: "WAITING_PAYMENT" },
      });
      return NextResponse.json({ simulation: true, paymentId: updated.id, amount: Number(updated.amount) });
    }

    const snap = await createSnapTransaction({
      orderId: gatewayOrderId,
      grossAmount: Number(payment.amount),
      itemName: paymentType.name,
      customer: {
        name: session.user.name,
        email: session.user.email,
        phone: (session.user as { phone?: string }).phone ?? null,
      },
    });

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayOrderId,
        snapToken: snap.token,
        paymentUrl: snap.redirectUrl,
        status: "WAITING_PAYMENT",
      },
    });

    return NextResponse.json({ snapToken: snap.token, redirectUrl: snap.redirectUrl, payment: updated });
  } catch (error) {
    console.error("Failed to initiate payment:", error);
    const message = error instanceof Error ? error.message : "Gagal memulai pembayaran";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
