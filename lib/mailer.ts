import { Resend } from "resend";
import nodemailer from "nodemailer";
export type InlineEmailImage = { filename: string; content: Buffer; contentId: string };
export async function sendEmail(to: string, subject: string, html: string, text?: string, images: InlineEmailImage[] = []) {
  const smtpUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || (smtpUser && smtpPass ? `BenchScout <${smtpUser}>` : undefined);
  if (!from) throw new Error("EMAIL_FROM is required");
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || "587");
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Configure a valid SMTP_PORT");
    const local = ["127.0.0.1", "localhost", "::1"].includes(process.env.SMTP_HOST);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    if (!local && (!user || !pass)) throw new Error("SMTP_USER and SMTP_PASSWORD are required for remote SMTP");
    const secure = process.env.SMTP_SECURE === "true";
    await nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure, requireTLS: !local && !secure, ...(user && pass ? {auth:{user,pass}} : {}), connectionTimeout:10000, socketTimeout:10000 }).sendMail({from,to,subject,html,...(text ? {text} : {}),...(images.length ? {attachments:images.map(image=>({filename:image.filename,content:image.content,cid:image.contentId,contentType:"image/png",contentDisposition:"inline" as const}))} : {})});
    return;
  }
  if (process.env.RESEND_API_KEY) {
    try {
      const result = await new Resend(process.env.RESEND_API_KEY).emails.send({ from, to, subject, html, ...(text ? { text } : {}), ...(images.length ? { attachments: images.map(image => ({ ...image, content: image.content.toString("base64") })) } : {}) });
      if (!result.error) return;
    } catch { /* Try the configured SMTP fallback. */ }
  }
  const user = smtpUser;
  const pass = smtpPass;
  if (!user || !pass) throw new Error("No email delivery provider is configured");
  await nodemailer.createTransport({ service: "gmail", auth: { user, pass }, connectionTimeout: 10000, socketTimeout: 10000 }).sendMail({ from, to, subject, html, ...(text ? { text } : {}), ...(images.length ? { attachments: images.map(image => ({ filename: image.filename, content: image.content, cid: image.contentId, contentType: "image/png", contentDisposition: "inline" as const })) } : {}) });
}
