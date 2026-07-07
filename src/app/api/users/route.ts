import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { logAction } from "@/lib/audit";
import type { UserRole } from "@prisma/client";

const VALID_ROLES = Object.values(ROLES);
const ELEVATED_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = (session.user as { role?: string }).role;

    if (currentRole !== ROLES.ADMIN && currentRole !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.emailVerified ? "active" : "pending",
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pengguna" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = (session.user as { role?: string }).role;

    if (currentRole !== ROLES.ADMIN && currentRole !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Nama, email, dan password (minimal 8 karakter) diperlukan" },
        { status: 400 }
      );
    }

    const targetRole = role && VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]) ? role : ROLES.APPLICANT;

    if (
      currentRole === ROLES.ADMIN &&
      ELEVATED_ROLES.includes(targetRole as (typeof ELEVATED_ROLES)[number])
    ) {
      return NextResponse.json(
        { error: "Hanya Super Admin yang dapat membuat akun Admin." },
        { status: 403 }
      );
    }

    const created = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!created?.user?.id) {
      return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
    }

    const updated = await prisma.user.update({
      where: { id: created.user.id },
      data: { role: targetRole as UserRole },
      select: { id: true, name: true, email: true, role: true },
    });

    await logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      action: "USER_CREATED",
      targetType: "User",
      targetId: updated.id,
      metadata: { name: updated.name, email: updated.email, role: updated.role },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat pengguna";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
