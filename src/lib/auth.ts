import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { ROLES } from "./constants";

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
  // Next.js dev server auto-picks a different port (3001, 3002, ...) whenever the
  // configured one is already in use, which otherwise makes better-auth reject the
  // request with "Invalid origin". Only relax this in development.
  trustedOrigins: process.env.NODE_ENV === "production" ? [] : ["http://localhost:*"],
  plugins: [
    admin({
      // Deliberately SUPER_ADMIN only. better-auth's admin plugin has no
      // concept of "target role" (it can't express "ADMIN may ban a STAFF
      // account but not another ADMIN") — that nuance lives in this app's own
      // /api/users/* routes. If a plain ADMIN were also in this list, they
      // could call better-auth's own /api/auth/admin/* endpoints directly
      // (set-role, ban-user, impersonate-user, ...) and bypass those custom
      // checks entirely. Routes that let ADMIN act on non-elevated users
      // (e.g. ban) must do that mutation directly via Prisma instead of
      // through auth.api.banUser/etc, since those now require SUPER_ADMIN.
      adminRoles: [ROLES.SUPER_ADMIN],
      defaultRole: ROLES.APPLICANT,
      roles: {
        [ROLES.SUPER_ADMIN]: adminAc,
        [ROLES.ADMIN]: userAc,
        [ROLES.APPLICANT]: userAc,
        [ROLES.STAFF]: userAc,
        [ROLES.FINANCE]: userAc,
        [ROLES.PRINCIPAL]: userAc,
      },
    }),
  ],
});
