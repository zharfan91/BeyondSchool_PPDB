import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const applicantService = {
  async findByUserId(userId: string) {
    return prisma.applicant.findUnique({
      where: { userId },
      include: {
        registration: {
          include: {
            academicPeriod: true,
            program: true,
            documents: true,
            payments: true,
            selectionResults: true,
          },
        },
        parents: true,
        addresses: true,
        academicHistories: true,
      },
    });
  },

  async findByRegistrationNumber(registrationNumber: string) {
    return prisma.applicant.findUnique({
      where: { registrationNumber },
      include: {
        user: true,
        registration: {
          include: {
            academicPeriod: true,
            program: true,
            documents: true,
            payments: true,
            selectionResults: true,
            notes: {
              include: { user: { select: { name: true } } },
            },
          },
        },
        parents: true,
        addresses: true,
        academicHistories: true,
      },
    });
  },

  async list(filters?: {
    status?: string;
    programId?: string;
    search?: string;
  }) {
    const where: Prisma.ApplicantWhereInput = {};

    if (filters?.status) {
      where.registration = { status: filters.status as Prisma.EnumRegistrationStatusFilter["equals"] };
    }

    if (filters?.search) {
      where.OR = [
        { user: { name: { contains: filters.search } } },
        { registrationNumber: { contains: filters.search } },
      ];
    }

    const applicants = await prisma.applicant.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        registration: {
          include: {
            program: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applicants.map((applicant) => ({
      id: applicant.id,
      registrationNumber: applicant.registrationNumber ?? "-",
      name: applicant.user.name,
      program: applicant.registration?.program?.name ?? "-",
      status: applicant.registration?.status ?? "DRAFT",
      submittedAt:
        applicant.registration?.submittedAt ??
        applicant.registration?.createdAt ??
        applicant.createdAt,
    }));
  },

  async findById(id: string) {
    return prisma.applicant.findUnique({
      where: { id },
      include: {
        user: true,
        registration: {
          include: {
            academicPeriod: true,
            program: true,
            documents: true,
            payments: true,
            selectionResults: true,
          },
        },
        parents: true,
        addresses: true,
        academicHistories: true,
      },
    });
  },
};
