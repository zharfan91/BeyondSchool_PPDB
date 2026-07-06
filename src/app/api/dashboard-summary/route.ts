import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applicantService } from "@/services/applicant-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await applicantService.findByUserId(session.user.id);

    if (!applicant) {
      return NextResponse.json({ hasApplicant: false });
    }

    const registration = applicant.registration;
    const documents = registration?.documents ?? [];
    const payments = registration?.payments ?? [];
    const selectionResult = registration?.selectionResults?.[0] ?? null;

    return NextResponse.json({
      hasApplicant: true,
      name: session.user.name,
      registrationNumber: applicant.registrationNumber,
      programName: registration?.program?.name ?? null,
      registrationStatus: registration?.status ?? null,
      stepCompleted: registration?.stepCompleted ?? 0,
      documents: {
        total: documents.length,
        verified: documents.filter((d) => d.isVerified).length,
      },
      payments: {
        total: payments.length,
        paid: payments.filter((p) => p.status === "PAID" || p.status === "VERIFIED").length,
      },
      selectionStatus: selectionResult?.status ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    return NextResponse.json(
      { error: "Gagal memuat ringkasan dashboard" },
      { status: 500 }
    );
  }
}
