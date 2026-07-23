import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
const prisma = new PrismaClient();
const KEY = "SB-Mid-server-TESTKEY123";
async function main() {
  const reg = await prisma.registration.findFirst({ where: { applicant: { firstName: "Siti" } } });
  const pt = await prisma.paymentType.findFirst({ where: { code: "REGISTRATION_FEE" } });
  if (!reg || !pt) throw new Error("missing reg/paymentType");
  await prisma.payment.deleteMany({ where: { gatewayOrderId: "INV-WEBHOOKTEST-1" } });
  const p = await prisma.payment.create({
    data: {
      registrationId: reg.id, paymentTypeId: pt.id, invoiceNumber: "INV/WEBHOOKTEST/1",
      amount: 500000, status: "WAITING_PAYMENT", gatewayOrderId: "INV-WEBHOOKTEST-1",
    },
  });
  const orderId = "INV-WEBHOOKTEST-1", statusCode = "200", gross = "500000.00";
  const sig = createHash("sha512").update(orderId + statusCode + gross + KEY).digest("hex");
  console.log("PAYMENT_ID=" + p.id);
  console.log("SIG=" + sig);
}
main().finally(() => prisma.$disconnect());
