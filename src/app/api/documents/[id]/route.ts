import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { registration: { include: { applicant: true } } },
    });

    if (!document) {
      return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });
    }

    if (document.registration.applicant.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (document.isVerified) {
      return NextResponse.json(
        { error: "Dokumen yang sudah diverifikasi tidak dapat dihapus" },
        { status: 403 }
      );
    }

    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "Gagal menghapus dokumen" },
      { status: 500 }
    );
  }
}
