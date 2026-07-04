import { prisma } from "@/lib/prisma";

export const paymentService = {
  async findByRegistration(registrationId: string) {
    return prisma.payment.findMany({
      where: { registrationId },
      include: { paymentType: true },
    });
  },

  async create(data: {
    registrationId: string;
    paymentTypeId: string;
    amount: number;
  }) {
    const count = await prisma.payment.count();
    const invoiceNumber = `INV/${new Date().getFullYear()}/${String(count + 1).padStart(5, "0")}`;

    return prisma.payment.create({
      data: {
        registrationId: data.registrationId,
        paymentTypeId: data.paymentTypeId,
        amount: data.amount,
        invoiceNumber,
      },
    });
  },

  async verify(paymentId: string, userId: string) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "VERIFIED",
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });
  },

  async getPaymentSummary() {
    const payments = await prisma.payment.findMany({
      where: { status: "VERIFIED" },
    });

    return {
      total: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      count: payments.length,
    };
  },
};
