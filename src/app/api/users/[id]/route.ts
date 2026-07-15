import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES, ELEVATED_ROLES } from "@/lib/constants";
import { logAction } from "@/lib/audit";
import type { UserRole } from "@prisma/client";

const VALID_ROLES = Object.values(ROLES);

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

    if (currentRole !== ROLES.ADMIN && currentRole !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body as { role?: string };

    if (!role || !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    if (
      id === session.user.id &&
      role !== ROLES.ADMIN &&
      role !== ROLES.SUPER_ADMIN
    ) {
      return NextResponse.json(
        { error: "Anda tidak dapat menurunkan role akun Anda sendiri." },
        { status: 400 }
      );
    }

    if (currentRole === ROLES.ADMIN) {
      const requestingElevatedRole = ELEVATED_ROLES.includes(
        role as (typeof ELEVATED_ROLES)[number]
      );
      const targetIsElevated = ELEVATED_ROLES.includes(
        existingUser.role as (typeof ELEVATED_ROLES)[number]
      );

      if (requestingElevatedRole || targetIsElevated) {
        return NextResponse.json(
          { error: "Hanya Super Admin yang dapat mengubah role Admin." },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as UserRole },
      select: { id: true, name: true, email: true, role: true },
    });

    // Best-effort: never let an audit-log hiccup mask an already-successful role change.
    logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      action: "USER_ROLE_CHANGED",
      targetType: "User",
      targetId: updated.id,
      metadata: { name: updated.name, email: updated.email, fromRole: existingUser.role, toRole: updated.role },
    }).catch((error) => console.error("Failed to write audit log:", error));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { error: "Gagal mengubah role pengguna" },
      { status: 500 }
    );
  }
}
