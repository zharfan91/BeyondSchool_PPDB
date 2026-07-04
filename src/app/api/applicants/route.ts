import { NextResponse } from "next/server";
import { applicantService } from "@/services/applicant-service";

export async function GET(request: Request) {
  try {
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
