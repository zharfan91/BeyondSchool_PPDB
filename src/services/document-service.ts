import { prisma } from "@/lib/prisma";

export const documentService = {
  async findByRegistration(registrationId: string) {
    return prisma.document.findMany({
      where: { registrationId },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: {
    registrationId: string;
    type: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    filePath: string;
  }) {
    return prisma.document.create({ data });
  },

  async verify(documentId: string, userId: string) {
    return prisma.document.update({
      where: { id: documentId },
      data: {
        isVerified: true,
        verifiedBy: userId,
        verifiedAt: new Date(),
      },
    });
  },

  async reject(documentId: string, reason: string) {
    return prisma.document.update({
      where: { id: documentId },
      data: { rejectionNote: reason },
    });
  },
};
