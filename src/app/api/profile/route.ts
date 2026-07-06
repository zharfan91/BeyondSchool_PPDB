import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APIError } from "better-auth/api";

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
      await prisma.user.update({
        where: { id: session.user.id },
        data: { isActive: false },
      });

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
