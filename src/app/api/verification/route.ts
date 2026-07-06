import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

const ALLOWED_ROLES = [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN];

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
      where: { status: { in: ["SUBMITTED", "COMPLETED"] } },
      include: {
        applicant: {
          include: { user: { select: { name: true } } },
        },
        documents: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const mapped = registrations.map((r) => {
      const totalDocs = r.documents.length;
      const verifiedDocs = r.documents.filter((d) => d.isVerified).length;
      return {
        id: r.id,
        registrationNumber: r.applicant?.registrationNumber ?? "-",
        name: r.applicant?.user?.name ?? "-",
        documents: `${verifiedDocs}/${totalDocs}`,
        status: r.status,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Failed to fetch verification data:", error);
    return NextResponse.json(
      { error: "Gagal memuat data verifikasi" },
      { status: 500 }
    );
  }
}
