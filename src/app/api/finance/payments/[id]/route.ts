import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { paymentService } from "@/services/payment-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== ROLES.FINANCE && role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action?: string };

    if (action !== "verify") {
      return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    if (payment.status !== "PAID") {
      return NextResponse.json(
        { error: "Hanya pembayaran berstatus Lunas yang dapat diverifikasi" },
        { status: 400 }
      );
    }

    const updated = await paymentService.verify(id, session.user.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to verify payment:", error);
    return NextResponse.json({ error: "Gagal memverifikasi pembayaran" }, { status: 500 });
  }
}
