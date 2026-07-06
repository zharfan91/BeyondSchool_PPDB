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
    const registration = applicant?.registration;

    if (!registration) {
      return NextResponse.json({ registrationId: null, documents: [] });
    }

    const documents = registration.documents
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        originalName: doc.originalName,
        filePath: doc.filePath,
        isVerified: doc.isVerified,
        rejectionNote: doc.rejectionNote,
        createdAt: doc.createdAt,
      }));

    return NextResponse.json({ registrationId: registration.id, documents });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Gagal memuat data dokumen" },
      { status: 500 }
    );
  }
}
