import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action?: string };

    if (action !== "confirm") {
      return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
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

    if (payment.status !== "PENDING" && payment.status !== "WAITING_PAYMENT") {
      return NextResponse.json(
        { error: "Pembayaran ini tidak dapat dikonfirmasi dari status saat ini" },
        { status: 400 }
      );
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to confirm payment:", error);
    return NextResponse.json(
      { error: "Gagal mengonfirmasi pembayaran" },
      { status: 500 }
    );
  }
}
