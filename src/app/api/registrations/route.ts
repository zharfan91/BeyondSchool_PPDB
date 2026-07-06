import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicantService } from "@/services/applicant-service";
import { registrationService } from "@/services/registration-service";
import type { Gender } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await applicantService.findByUserId(session.user.id);

    return NextResponse.json({ applicant });
  } catch (error) {
    console.error("Failed to fetch registration:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pendaftaran" },
      { status: 500 }
    );
  }
}

interface CreatePayload {
  personal: {
    firstName: string;
    nickName?: string;
    birthPlace: string;
    birthDate: string;
    gender: string;
    religion: string;
    childNumber?: number | null;
    siblingsCount?: number | null;
  };
  address: {
    street: string;
    village?: string;
    subDistrict: string;
    city: string;
    province: string;
    postalCode: string;
  };
  parents: {
    father: { name: string; occupation?: string; phone: string; education?: string };
    mother: { name: string; occupation?: string; phone: string; education?: string };
  };
  academic: {
    institutionName: string;
    level: string;
    nisn?: string;
    graduationYear?: number | null;
  };
  programId: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body?.action === "finalize") {
      const { registrationId } = body as { registrationId?: string };
      if (!registrationId) {
        return NextResponse.json({ error: "registrationId diperlukan" }, { status: 400 });
      }

      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: { applicant: true },
      });

      if (!registration || registration.applicant.userId !== session.user.id) {
        return NextResponse.json({ error: "Registrasi tidak ditemukan" }, { status: 404 });
      }

      await registrationService.submit(registrationId);

      return NextResponse.json({
        registrationNumber: registration.applicant.registrationNumber,
      });
    }

    const { personal, address, parents, academic, programId } = body as CreatePayload;

    if (
      !personal?.firstName ||
      !personal?.birthPlace ||
      !personal?.birthDate ||
      !personal?.gender ||
      !personal?.religion ||
      !address?.street ||
      !address?.city ||
      !address?.province ||
      !address?.postalCode ||
      !parents?.father?.name ||
      !parents?.father?.phone ||
      !parents?.mother?.name ||
      !parents?.mother?.phone ||
      !academic?.institutionName ||
      !academic?.level ||
      !programId
    ) {
      return NextResponse.json({ error: "Data wajib belum lengkap" }, { status: 400 });
    }

    const activePeriod = await registrationService.getActivePeriod();
    if (!activePeriod) {
      return NextResponse.json(
        { error: "Tidak ada periode pendaftaran yang sedang aktif" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const applicant = await tx.applicant.upsert({
        where: { userId: session.user.id },
        update: {
          firstName: personal.firstName,
          nickName: personal.nickName || null,
          birthPlace: personal.birthPlace,
          birthDate: new Date(personal.birthDate),
          gender: personal.gender as Gender,
          religion: personal.religion,
          childNumber: personal.childNumber ?? null,
          siblingsCount: personal.siblingsCount ?? null,
        },
        create: {
          userId: session.user.id,
          firstName: personal.firstName,
          nickName: personal.nickName || null,
          birthPlace: personal.birthPlace,
          birthDate: new Date(personal.birthDate),
          gender: personal.gender as Gender,
          religion: personal.religion,
          childNumber: personal.childNumber ?? null,
          siblingsCount: personal.siblingsCount ?? null,
        },
      });

      let registrationNumber = applicant.registrationNumber;
      if (!registrationNumber) {
        const count = await tx.applicant.count({
          where: { registrationNumber: { not: null } },
        });
        registrationNumber = `PPDB/${activePeriod.year}/${String(count + 1).padStart(5, "0")}`;
        await tx.applicant.update({
          where: { id: applicant.id },
          data: { registrationNumber },
        });
      }

      await tx.address.deleteMany({ where: { applicantId: applicant.id, type: "HOME" } });
      await tx.address.create({
        data: {
          applicantId: applicant.id,
          type: "HOME",
          street: address.street,
          village: address.village || null,
          subDistrict: address.subDistrict,
          district: address.subDistrict,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
        },
      });

      await tx.parent.deleteMany({
        where: { applicantId: applicant.id, type: { in: ["FATHER", "MOTHER"] } },
      });
      await tx.parent.createMany({
        data: [
          {
            applicantId: applicant.id,
            type: "FATHER",
            name: parents.father.name,
            occupation: parents.father.occupation || null,
            phone: parents.father.phone,
            education: parents.father.education || null,
          },
          {
            applicantId: applicant.id,
            type: "MOTHER",
            name: parents.mother.name,
            occupation: parents.mother.occupation || null,
            phone: parents.mother.phone,
            education: parents.mother.education || null,
          },
        ],
      });

      await tx.academicHistory.deleteMany({
        where: { applicantId: applicant.id, isPreviousSchool: true },
      });
      await tx.academicHistory.create({
        data: {
          applicantId: applicant.id,
          isPreviousSchool: true,
          institutionName: academic.institutionName,
          level: academic.level as import("@prisma/client").EducationLevel,
          city: address.city,
          province: address.province,
          nisn: academic.nisn || null,
          graduationYear: academic.graduationYear ?? new Date().getFullYear(),
        },
      });

      const existingRegistration = await tx.registration.findUnique({
        where: { applicantId: applicant.id },
      });

      const registration = existingRegistration
        ? await tx.registration.update({
            where: { id: existingRegistration.id },
            data: { programId, stepCompleted: 4 },
          })
        : await tx.registration.create({
            data: {
              applicantId: applicant.id,
              academicPeriodId: activePeriod.id,
              programId,
              stepCompleted: 4,
            },
          });

      return {
        applicantId: applicant.id,
        registrationId: registration.id,
        registrationNumber,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to save registration:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data pendaftaran" },
      { status: 500 }
    );
  }
}
