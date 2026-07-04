import { prisma } from "@/lib/prisma";

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
    const where: Record<string, unknown> = {};

    if (filters?.status) {
      where.registration = { status: filters.status };
    }

    return prisma.applicant.findMany({
      where: where as any,
      include: {
        user: { select: { name: true, email: true } },
        registration: { include: { program: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
