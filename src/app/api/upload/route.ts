import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DOCUMENT_TYPES, ROLES } from "@/lib/constants";
import { documentService } from "@/services/document-service";
import type { DocumentType } from "@prisma/client";

const ALLOWED_ROLES = [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const registrationId = formData.get("registrationId") as string | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: "File dan tipe dokumen diperlukan" },
        { status: 400 }
      );
    }

    if (!DOCUMENT_TYPES.some((docType) => docType.value === type)) {
      return NextResponse.json(
        { error: "Tipe dokumen tidak valid" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const ext = ALLOWED_MIME_EXTENSIONS[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung" },
        { status: 400 }
      );
    }

    if (registrationId) {
      const currentRole = (session.user as { role?: string }).role;
      const isPrivileged = ALLOWED_ROLES.includes(
        currentRole as (typeof ALLOWED_ROLES)[number]
      );

      if (!isPrivileged) {
        const registration = await prisma.registration.findUnique({
          where: { id: registrationId },
          include: { applicant: true },
        });

        if (registration?.applicant?.userId !== session.user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    const filePath = `/uploads/${fileName}`;

    if (registrationId) {
      const document = await documentService.create({
        registrationId,
        type: type as DocumentType,
        fileName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        filePath,
      });

      return NextResponse.json({
        fileName,
        filePath,
        fileSize: file.size,
        id: document.id,
      });
    }

    return NextResponse.json({
      fileName,
      filePath,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Gagal mengupload file" },
      { status: 500 }
    );
  }
}
