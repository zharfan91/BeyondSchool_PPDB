import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
