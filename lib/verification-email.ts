import { applicationOrigin } from "@/lib/security";
import { sendEmail } from "@/lib/mailer";
import type { AccountRole } from "@/lib/account-tokens";

export async function sendVerificationEmail(request: Request, email: string, token: string, role: AccountRole) {
    const url = new URL("/verify", applicationOrigin(request));
    url.searchParams.set("email", email);
    url.searchParams.set("token", token);
    url.searchParams.set("role", role);
    const href = url.toString().replace(/&/g, "&amp;");
    await sendEmail(email, "Confirm your BenchScout account", `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:28px;color:#0B2444;background:#f8fafc;border-radius:16px"><h1 style="font-family:Georgia,serif">Bench<span style="color:#1A8C7A">Scout</span></h1><h2>Confirm your email</h2><p>Confirm your email address to sign in to your ${role === "employer" ? "employer account" : "career hub"}.</p>${role === "employer" ? "<p>Company review is a separate step before publishing vacancies or viewing applicants.</p>" : ""}<p><a href="${href}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#0B2444;color:white;text-decoration:none">Confirm email</a></p><p>This link expires in 24 hours. If you did not create this account, ignore this email.</p></div>`, `Confirm your BenchScout email: ${url.toString()}\nThis link expires in 24 hours.`);
}
