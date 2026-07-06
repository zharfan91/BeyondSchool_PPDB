import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applicantService } from "@/services/applicant-service";
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const applicants = await applicantService.list({ status, search });
    return NextResponse.json(applicants);
  } catch (error) {
    console.error("Failed to fetch applicants:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pendaftar" },
      { status: 500 }
    );
  }
}
