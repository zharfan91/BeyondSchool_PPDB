import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { selectionService } from "@/services/selection-service";
import type { SelectionStatus } from "@prisma/client";

const ALLOWED_ROLES = [ROLES.PRINCIPAL, ROLES.ADMIN, ROLES.SUPER_ADMIN];

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
    const { decision } = body as {
      decision?: SelectionStatus;
      notes?: string;
    };

    if (decision !== "PASSED" && decision !== "REJECTED") {
      return NextResponse.json({ error: "Keputusan tidak valid" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { selectionResults: true },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const existingResult = registration.selectionResults[0];

    let result;
    if (!existingResult) {
      const created = await selectionService.create({
        registrationId: id,
        score: 0,
        status: decision,
      });
      result = await selectionService.updateStatus(created.id, decision, session.user.id);
    } else {
      result = await selectionService.updateStatus(
        existingResult.id,
        decision,
        session.user.id
      );
    }

    if (decision === "PASSED") {
      await prisma.registration.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update selection:", error);
    return NextResponse.json(
      { error: "Gagal memproses seleksi" },
      { status: 500 }
    );
  }
}
