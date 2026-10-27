import { sendEmail } from "@/lib/mailer";
import { accountEmailLayout } from "@/lib/account-email-layout";

export async function passwordResetEmail(resetLink: string) {
  return accountEmailLayout({
    label: "PASSWORD RESET",
    title: "A fresh start for your account",
    paragraphs: ["Choose a new password to get back to your career hub."],
    actionLabel: "Reset your password",
    actionUrl: resetLink,
    expiry: "This link expires in one hour and can be used once.",
    footer: "Did not request this? You can ignore this email. Your password will stay unchanged.",
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const content = await passwordResetEmail(resetLink);
  await sendEmail(email, "Reset your BenchScout password", content.html, content.text, content.images);
}
