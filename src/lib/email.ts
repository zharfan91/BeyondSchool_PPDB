import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  const client = getTransporter();

  if (!client) {
    console.log(`[email] SMTP belum dikonfigurasi. Email ke ${options.to}: ${options.subject}`);
    console.log(options.html);
    return;
  }

  await client.sendMail({
    from: process.env.SMTP_FROM || "Beyond School PPDB <no-reply@beyondschool.sch.id>",
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
