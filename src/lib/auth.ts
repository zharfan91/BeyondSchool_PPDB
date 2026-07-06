import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Sends via SMTP_HOST if configured (see .env.example); otherwise logs the link.
      await sendEmail({
        to: user.email,
        subject: "Reset Password - Beyond School PPDB",
        html: `<p>Halo ${user.name},</p><p>Klik tautan berikut untuk mengatur ulang password Anda:</p><p><a href="${url}">${url}</a></p><p>Jika Anda tidak meminta ini, abaikan email ini.</p>`,
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "APPLICANT",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
