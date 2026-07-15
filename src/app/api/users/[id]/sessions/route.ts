import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { logAction } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = (session.user as { role?: string }).role;
    if (currentRole !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const result = await auth.api.listUserSessions({
      body: { userId: id },
      headers: request.headers,
    });

    return NextResponse.json(result.sessions);
  } catch (error) {
    console.error("Failed to list user sessions:", error);
    const message = error instanceof Error ? error.message : "Gagal memuat sesi pengguna";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = (session.user as { role?: string }).role;
    if (currentRole !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { sessionToken } = body as { sessionToken?: string };

    const targetUser = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true } });
    if (!targetUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Best-effort: never let an audit-log hiccup mask an already-successful revoke.
    if (sessionToken) {
      await auth.api.revokeUserSession({
        body: { sessionToken },
        headers: request.headers,
      });
      logAction({
        actorId: session.user.id,
        actorName: session.user.name,
        action: "SESSION_REVOKED",
        targetType: "User",
        targetId: id,
        metadata: { name: targetUser.name, email: targetUser.email },
      }).catch((error) => console.error("Failed to write audit log:", error));
    } else {
      await auth.api.revokeUserSessions({
        body: { userId: id },
        headers: request.headers,
      });
      logAction({
        actorId: session.user.id,
        actorName: session.user.name,
        action: "SESSION_REVOKED_ALL",
        targetType: "User",
        targetId: id,
        metadata: { name: targetUser.name, email: targetUser.email },
      }).catch((error) => console.error("Failed to write audit log:", error));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to revoke session(s):", error);
    const message = error instanceof Error ? error.message : "Gagal mencabut sesi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
