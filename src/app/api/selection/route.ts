import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

const ALLOWED_ROLES = [ROLES.PRINCIPAL, ROLES.ADMIN, ROLES.SUPER_ADMIN];

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = (session.user as { role?: string }).role;

    if (!ALLOWED_ROLES.includes(currentRole as (typeof ALLOWED_ROLES)[number])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const registrations = await prisma.registration.findMany({
      where: { status: "VERIFIED" },
      include: {
        applicant: {
          include: { user: { select: { name: true } } },
        },
        program: true,
        selectionResults: true,
      },
    });

    const mapped = registrations.map((r) => ({
      id: r.id,
      registrationNumber: r.applicant?.registrationNumber ?? "-",
      name: r.applicant?.user?.name ?? "-",
      program: r.program?.name ?? "-",
      currentStatus: r.selectionResults[0]?.status ?? "PENDING",
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Failed to fetch selection data:", error);
    return NextResponse.json(
      { error: "Gagal memuat data seleksi" },
      { status: 500 }
    );
  }
}
