import { prisma } from "@/lib/prisma";

export const registrationService = {
  async create(data: {
    applicantId: string;
    academicPeriodId: string;
    programId: string;
  }) {
    return prisma.registration.create({
      data: {
        applicantId: data.applicantId,
        academicPeriodId: data.academicPeriodId,
        programId: data.programId,
      },
    });
  },

  async updateStep(registrationId: string, step: number) {
    return prisma.registration.update({
      where: { id: registrationId },
      data: { stepCompleted: step },
    });
  },

  async submit(registrationId: string) {
    return prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
  },

  async verify(registrationId: string, userId: string) {
    return prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: userId,
      },
    });
  },

  async getActivePeriod() {
    return prisma.academicPeriod.findFirst({
      where: { isActive: true },
      include: {
        programs: { where: { isActive: true } },
        programQuotas: true,
      },
    });
  },
};
