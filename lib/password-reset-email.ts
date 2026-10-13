import { readFile } from "node:fs/promises";
import path from "node:path";
import { sendEmail } from "@/lib/mailer";

export async function passwordResetEmail(resetLink: string) {
  const logo = await readFile(path.join(process.cwd(), "public/icons/benchscout-192.png"));
  const href = resetLink.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return {
    images: [{ filename: "benchscout-logo.png", content: logo, contentId: "benchscout-logo" }],
    text: `Reset your BenchScout password: ${resetLink}\nThis link expires in one hour and can be used once. If you did not request it, ignore this email; your password will stay unchanged.`,
    html: `<!doctype html><html><body style="margin:0;background:#f3f7fa;color:#0b2444;font-family:Arial,Helvetica,sans-serif">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 16px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:440px;background:#ffffff;border:1px solid #e5edf1;border-radius:20px"><tr><td style="padding:28px;text-align:center">
        <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 20px"><tr><td><img src="cid:benchscout-logo" width="44" height="44" alt="BenchScout logo" style="display:block;border:0"></td><td style="padding-left:8px;font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#0b2444">Bench<span style="color:#1a8c7a">Scout</span></td></tr></table>
        <span style="display:inline-block;padding:5px 10px;background:#e8f6f2;border-radius:20px;color:#1a8c7a;font-size:10px;font-weight:bold;letter-spacing:1px">PASSWORD RESET</span>
        <h1 style="font-size:22px;line-height:1.3;font-weight:600;margin:18px 0 10px">A fresh start for your account</h1>
        <p style="font-size:14px;line-height:1.7;color:#64748b;margin:0 0 22px">Choose a new password to get back to your career hub.</p>
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%"><tr><td bgcolor="#0b2444" style="border-radius:12px;text-align:center"><a href="${href}" style="display:block;padding:14px 20px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none">Reset your password &rarr;</a></td></tr></table>
        <p style="font-size:12px;line-height:1.6;color:#46766c;margin:16px 0">This link expires in one hour and can be used once.</p>
        <p style="font-size:12px;line-height:1.7;color:#94a3b8;margin:20px 0 0;padding-top:18px;border-top:1px solid #e5edf1">Didn’t request this? You can ignore this email.<br>Your password will stay unchanged.</p>
      </td></tr></table></td></tr></table></body></html>`,
  };
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const content = await passwordResetEmail(resetLink);
  await sendEmail(email, "Reset your BenchScout password", content.html, content.text, content.images);
}
