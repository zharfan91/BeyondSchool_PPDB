import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyNotificationSignature,
  mapTransactionStatus,
  TERMINAL_SUCCESS,
  type MidtransNotification,
} from "@/lib/midtrans";

// Midtrans HTTP notification (webhook). Public route (no session) — Midtrans
// calls it server-to-server. Security comes from the SHA-512 signature check.
export async function POST(request: NextRequest) {
  try {
    const notification = (await request.json()) as MidtransNotification;

    if (!verifyNotificationSignature(notification)) {
      console.warn("Rejected Midtrans notification: invalid signature", notification.order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const newStatus = mapTransactionStatus(notification);
    if (!newStatus) {
      // A status we don't act on — acknowledge so Midtrans stops retrying.
      return NextResponse.json({ received: true });
    }

    const payment = await prisma.payment.findFirst({
      where: { gatewayOrderId: notification.order_id },
    });
    if (!payment) {
      console.warn("Midtrans notification for unknown order_id", notification.order_id);
      return NextResponse.json({ received: true });
    }

    // Never downgrade an already-successful payment (out-of-order notifications).
    if (TERMINAL_SUCCESS.includes(payment.status) && !TERMINAL_SUCCESS.includes(newStatus)) {
      return NextResponse.json({ received: true });
    }

    const isSuccess = TERMINAL_SUCCESS.includes(newStatus);
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        method: notification.payment_type ?? payment.method,
        vaNumber: notification.va_numbers?.[0]?.va_number ?? payment.vaNumber,
        bankName: notification.va_numbers?.[0]?.bank ?? payment.bankName,
        paidAmount: isSuccess ? payment.amount : payment.paidAmount,
        paidAt: isSuccess ? new Date() : payment.paidAt,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Failed to process payment webhook:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
