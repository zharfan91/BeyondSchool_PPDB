import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applicantService } from "@/services/applicant-service";
import { ROLES } from "@/lib/constants";

const ALLOWED_ROLES = [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN];

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

    if (!ALLOWED_ROLES.includes(currentRole as (typeof ALLOWED_ROLES)[number])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const applicant = await applicantService.findById(id);

    if (!applicant) {
      return NextResponse.json(
        { error: "Pendaftar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(applicant);
  } catch (error) {
    console.error("Failed to fetch applicant:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pendaftar" },
      { status: 500 }
    );
  }
}
