import { prisma } from "@/lib/prisma";
import type { SelectionStatus } from "@prisma/client";

export const selectionService = {
  async getByRegistration(registrationId: string) {
    return prisma.selectionResult.findUnique({
      where: { registrationId },
      include: { criteriaScores: true },
    });
  },

  async create(data: {
    registrationId: string;
    score: number;
    status?: SelectionStatus;
  }) {
    return prisma.selectionResult.create({
      data: {
        registrationId: data.registrationId,
        score: data.score,
        status: data.status || "PENDING",
      },
    });
  },

  async updateStatus(id: string, status: SelectionStatus, userId: string) {
    return prisma.selectionResult.update({
      where: { id },
      data: {
        status,
        decidedBy: userId,
        decidedAt: new Date(),
      },
    });
  },

  async getSummary() {
    const results = await prisma.selectionResult.groupBy({
      by: ["status"],
      _count: true,
    });

    const summary: Record<string, number> = {};
    results.forEach((r) => {
      summary[r.status] = r._count;
    });

    return summary;
  },
};
