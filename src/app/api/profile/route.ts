import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APIError } from "better-auth/api";
import { ROLES } from "@/lib/constants";
import { logAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "Gagal memuat data profil" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, name, phone, currentPassword, newPassword } = body as {
      action?: string;
      name?: string;
      phone?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    if (action === "deactivate") {
      const currentRole = (session.user as { role?: string }).role;

      if (currentRole === ROLES.SUPER_ADMIN) {
        const otherActiveSuperAdmins = await prisma.user.count({
          where: { role: ROLES.SUPER_ADMIN, banned: false, id: { not: session.user.id } },
        });
        if (otherActiveSuperAdmins === 0) {
          return NextResponse.json(
            {
              error:
                "Anda adalah satu-satunya Super Admin aktif. Tunjuk Super Admin lain sebelum menonaktifkan akun ini.",
            },
            { status: 400 }
          );
        }
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: { isActive: false, banned: true, banReason: "Dinonaktifkan sendiri oleh pengguna" },
      });

      // Deactivating should end every session on every device immediately, not
      // just the browser tab that clicked the button (that one is separately
      // signed out client-side after this call succeeds).
      await prisma.session.deleteMany({ where: { userId: session.user.id } });

      logAction({
        actorId: session.user.id,
        actorName: session.user.name,
        action: "USER_SELF_DEACTIVATED",
        targetType: "User",
        targetId: session.user.id,
        metadata: { name: session.user.name, email: session.user.email },
      }).catch((error) => console.error("Failed to write audit log:", error));

      return NextResponse.json({ success: true });
    }

    if (action === "changePassword") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Password saat ini dan password baru wajib diisi" },
          { status: 400 }
        );
      }

      try {
        await auth.api.changePassword({
          body: { currentPassword, newPassword },
          headers: request.headers,
        });
      } catch (error) {
        if (error instanceof APIError) {
          return NextResponse.json(
            { error: error.body?.message ?? "Gagal mengganti password" },
            { status: error.statusCode }
          );
        }
        throw error;
      }

      return NextResponse.json({ success: true });
    }

    const data: { name?: string; phone?: string } = {};
    if (typeof name === "string") data.name = name;
    if (typeof phone === "string") data.phone = phone;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, phone: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
