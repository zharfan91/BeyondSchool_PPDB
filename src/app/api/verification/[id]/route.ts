import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { documentService } from "@/services/document-service";
import { registrationService } from "@/services/registration-service";

const ALLOWED_ROLES = [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = (session.user as { role?: string }).role;

    if (!ALLOWED_ROLES.includes(currentRole as (typeof ALLOWED_ROLES)[number])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, note } = body as { action?: string; note?: string };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      const documents = await documentService.findByRegistration(id);

      for (const document of documents) {
        if (!document.isVerified) {
          await documentService.verify(document.id, session.user.id);
        }
      }

      const updated = await registrationService.verify(id, session.user.id);
      return NextResponse.json(updated);
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: { status: "INCOMPLETE", reviewNotes: note ?? null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update verification:", error);
    return NextResponse.json(
      { error: "Gagal memproses verifikasi" },
      { status: 500 }
    );
  }
}
