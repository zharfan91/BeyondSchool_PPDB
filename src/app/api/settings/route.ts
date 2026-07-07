import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { logAction } from "@/lib/audit";

async function getOrCreateSettings() {
  const existing = await prisma.settings.findFirst();
  if (existing) return existing;
  return prisma.settings.create({
    data: {
      schoolName: "Beyond School",
      schoolAddress: "Jl. Pendidikan No. 1, Jakarta",
      bankName: "Bank Mandiri",
      bankAccountNumber: "123-00-4567890-1",
      bankAccountHolder: "Yayasan Beyond School",
      emailVerificationTemplate: "Selamat {name}, pendaftaran Anda telah diverifikasi.",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getOrCreateSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Gagal memuat pengaturan" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Hanya Super Admin yang dapat mengubah pengaturan sistem." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { schoolName, schoolAddress, bankName, bankAccountNumber, bankAccountHolder, emailVerificationTemplate } = body as {
      schoolName?: string;
      schoolAddress?: string;
      bankName?: string;
      bankAccountNumber?: string;
      bankAccountHolder?: string;
      emailVerificationTemplate?: string;
    };

    const current = await getOrCreateSettings();

    const updated = await prisma.settings.update({
      where: { id: current.id },
      data: {
        schoolName: schoolName ?? current.schoolName,
        schoolAddress: schoolAddress ?? current.schoolAddress,
        bankName: bankName ?? current.bankName,
        bankAccountNumber: bankAccountNumber ?? current.bankAccountNumber,
        bankAccountHolder: bankAccountHolder ?? current.bankAccountHolder,
        emailVerificationTemplate: emailVerificationTemplate ?? current.emailVerificationTemplate,
        updatedBy: session.user.id,
      },
    });

    await logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      action: "SETTINGS_UPDATED",
      targetType: "Settings",
      targetId: updated.id,
      metadata: { schoolName: updated.schoolName, bankName: updated.bankName },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengaturan" }, { status: 500 });
  }
}
