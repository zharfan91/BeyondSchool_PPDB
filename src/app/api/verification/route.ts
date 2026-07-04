import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
