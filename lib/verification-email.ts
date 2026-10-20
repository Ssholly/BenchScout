import { applicationOrigin } from "@/lib/security";
import { sendEmail } from "@/lib/mailer";
import type { AccountRole } from "@/lib/account-tokens";
import { accountEmailLayout } from "@/lib/account-email-layout";

export async function sendVerificationEmail(request: Request, email: string, token: string, role: AccountRole) {
    const url = new URL("/verify", applicationOrigin(request));
    url.searchParams.set("email", email);
    url.searchParams.set("token", token);
    url.searchParams.set("role", role);
    const content = await accountEmailLayout({
        label: "EMAIL CONFIRMATION",
        title: "Confirm your email",
        paragraphs: [
            `Confirm your email address to sign in to your ${role === "employer" ? "employer account" : "career hub"}.`,
            ...(role === "employer" ? ["Company review is a separate step before publishing vacancies or viewing applicants."] : []),
        ],
        actionLabel: "Confirm email",
        actionUrl: url.toString(),
        expiry: "This link expires in 24 hours and can be used once.",
        footer: "Did not create this account? You can ignore this email.",
    });
    await sendEmail(email, "Confirm your BenchScout account", content.html, content.text, content.images);
}
