import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { isSimulationMode } from "@/lib/midtrans";

// Stand-in for the Midtrans webhook while in simulation mode: the applicant
// (or staff) picks a success/fail outcome and we apply it directly. Disabled
// entirely once a real Midtrans key is configured, so it can never be used to
// bypass real payments.
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSimulationMode()) {
      return NextResponse.json(
        { error: "Simulasi tidak tersedia — payment gateway sungguhan sedang aktif." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { paymentId, outcome } = body as { paymentId?: string; outcome?: "success" | "fail" };

    if (!paymentId || (outcome !== "success" && outcome !== "fail")) {
      return NextResponse.json({ error: "Data simulasi tidak valid" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { registration: { include: { applicant: true } } },
    });
    if (!payment) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    const role = (session.user as { role?: string }).role;
    const isOwner = payment.registration.applicant.userId === session.user.id;
    const isStaff = role === ROLES.FINANCE || role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (payment.status === "VERIFIED" || payment.status === "PAID") {
      return NextResponse.json({ error: "Pembayaran ini sudah lunas." }, { status: 400 });
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data:
        outcome === "success"
          ? {
              status: "VERIFIED",
              method: "SIMULATION",
              paidAmount: payment.amount,
              paidAt: new Date(),
            }
          : { status: "FAILED" },
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    console.error("Failed to simulate payment:", error);
    return NextResponse.json({ error: "Gagal memproses simulasi" }, { status: 500 });
  }
}
