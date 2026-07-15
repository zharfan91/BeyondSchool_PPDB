import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES, ELEVATED_ROLES } from "@/lib/constants";
import { logAction } from "@/lib/audit";

export async function POST(
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
    const { action, reason } = body as { action?: "ban" | "unban"; reason?: string };

    if (action !== "ban" && action !== "unban") {
      return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Anda tidak dapat menonaktifkan akun Anda sendiri di sini." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true, name: true, email: true } });
    if (!targetUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    if (
      currentRole === ROLES.ADMIN &&
      ELEVATED_ROLES.includes(targetUser.role as (typeof ELEVATED_ROLES)[number])
    ) {
      return NextResponse.json(
        { error: "Hanya Super Admin yang dapat menonaktifkan akun Admin." },
        { status: 403 }
      );
    }

    if (currentRole === ROLES.SUPER_ADMIN) {
      // better-auth's own admin plugin only trusts SUPER_ADMIN (see src/lib/auth.ts),
      // so only a SUPER_ADMIN session can go through it here.
      if (action === "ban") {
        await auth.api.banUser({
          body: { userId: id, banReason: reason },
          headers: request.headers,
        });
      } else {
        await auth.api.unbanUser({
          body: { userId: id },
          headers: request.headers,
        });
      }
    } else {
      // Plain ADMIN, acting on a non-elevated target (checked above). Since
      // ADMIN isn't in better-auth's adminRoles, auth.api.banUser/unbanUser
      // would reject this session — apply the same effect directly instead:
      // flip the flag and force-logout every existing session, matching what
      // banUser itself does internally.
      if (action === "ban") {
        await prisma.user.update({
          where: { id },
          data: { banned: true, banReason: reason ?? null },
        });
        await prisma.session.deleteMany({ where: { userId: id } });
      } else {
        await prisma.user.update({
          where: { id },
          data: { banned: false, banReason: null, banExpires: null },
        });
      }
    }

    // Best-effort: never let an audit-log hiccup mask an already-successful ban/unban.
    logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      action: action === "ban" ? "USER_BANNED" : "USER_UNBANNED",
      targetType: "User",
      targetId: id,
      metadata: { name: targetUser.name, email: targetUser.email, reason: reason ?? null },
    }).catch((error) => console.error("Failed to write audit log:", error));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to ban/unban user:", error);
    const message = error instanceof Error ? error.message : "Gagal memproses aksi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
