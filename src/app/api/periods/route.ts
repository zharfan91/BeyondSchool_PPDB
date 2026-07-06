import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import type { Semester } from "@prisma/client";

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const role = (session.user as { role?: string }).role;
  if (role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request: NextRequest) {
  const auth1 = await requireAdmin(request);
  if (auth1.error) return auth1.error;

  try {
    const periods = await prisma.academicPeriod.findMany({
      include: { programs: true, programQuotas: { include: { program: true } } },
      orderBy: { year: "desc" },
    });
    return NextResponse.json(periods);
  } catch (error) {
    console.error("Failed to fetch periods:", error);
    return NextResponse.json({ error: "Gagal memuat periode" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth1 = await requireAdmin(request);
  if (auth1.error) return auth1.error;

  try {
    const body = await request.json();
    const { name, year, semester, startDate, endDate, description } = body as {
      name?: string;
      year?: number;
      semester?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    };

    if (!name || !year || !semester || !startDate || !endDate) {
      return NextResponse.json({ error: "Data periode belum lengkap" }, { status: 400 });
    }

    const created = await prisma.academicPeriod.create({
      data: {
        name,
        year,
        semester: semester as Semester,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description || null,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Failed to create period:", error);
    return NextResponse.json({ error: "Gagal membuat periode" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth1 = await requireAdmin(request);
  if (auth1.error) return auth1.error;

  try {
    const body = await request.json();
    const { id, isActive } = body as { id?: string; isActive?: boolean };

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    if (isActive) {
      await prisma.$transaction([
        prisma.academicPeriod.updateMany({ data: { isActive: false } }),
        prisma.academicPeriod.update({ where: { id }, data: { isActive: true } }),
      ]);
    } else {
      await prisma.academicPeriod.update({ where: { id }, data: { isActive: false } });
    }

    const updated = await prisma.academicPeriod.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update period:", error);
    return NextResponse.json({ error: "Gagal memperbarui periode" }, { status: 500 });
  }
}
