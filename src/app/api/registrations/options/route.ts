import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { registrationService } from "@/services/registration-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activePeriod = await registrationService.getActivePeriod();

    return NextResponse.json({ activePeriod });
  } catch (error) {
    console.error("Failed to fetch registration options:", error);
    return NextResponse.json(
      { error: "Gagal memuat opsi pendaftaran" },
      { status: 500 }
    );
  }
}
