import { applicationOrigin, ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { emailField, passwordField, textField } from "@/lib/security";
import { validateDocument, storeDocument, removeDocument, resumeText } from "@/lib/documents";
import crypto from "crypto";
import { sendEmail } from "@/lib/mailer";
import { storedAccountToken } from "@/lib/account-tokens";




export const POST = withApi("public", async (request: Request) => {
	try {
		const formData = await request.formData();
		const name = textField(formData.get("name"), "name");
		const email = emailField(formData.get("email"));
		const password = passwordField(formData.get("password"));
		const resume = formData.get("resume");
		if (resume instanceof File && resume.size > 0) await validateDocument(resume, "resume");
		const careerPhase = formData.get("careerPhase") === "internship" ? "internship" : "licensed";

		if (!name || !email || !password) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return NextResponse.json(
				{ error: "Email already registered" },
				{ status: 400 },
			);
		}

		const hashedPassword = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();
    const blob = resume instanceof File && resume.size > 0 ? await storeDocument(resume, "resume", userId) : null;
    const cvParsedText = blob ? await resumeText(blob.buffer) : null;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    try {
      await prisma.$transaction([
        prisma.user.create({ data: { id: userId, name, email, password: hashedPassword, careerPhase, resumeUrl: blob?.url || null, cvParsedText, keywords: "", location: "All Nigeria", isVerified: false } }),
        prisma.verificationToken.create({ data: { email, token: storedAccountToken(token), expiresAt } }),
      ]);
    } catch (error: unknown) {
    if (error instanceof ApiError) throw error; await removeDocument(blob?.url || null); throw error; }

		// 🚀 UPDATED: Now points directly to your live Vercel domain
		const appUrl = applicationOrigin(request);
		const verifyLink = `${appUrl}/verify?token=${token}&email=${encodeURIComponent(email)}`;

		const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
        <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #0058bc 0%, #0ea5e9 100%); border-radius: 14px; margin: 0 auto 24px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0, 88, 188, 0.2);">
          <span style="color: white; font-size: 28px; font-weight: 900; font-family: sans-serif;">B</span>
        </div>
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.5px;">Confirm your account</h1>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 auto 32px auto; max-width: 400px;">
          Welcome to BenchScout. To verify your email address and activate your account, please click the button below.
        </p>
        <a href="${verifyLink}" style="display: inline-block; background-color: #0058bc; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 88, 188, 0.2);">
          Confirm Account
        </a>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
          If you didn't request this email, there's nothing to worry about — you can safely ignore it.
        </p>
      </div>
    `;

    try { await sendEmail(email, "Confirm your BenchScout account", emailHtml); }
    catch { return NextResponse.json({ success: true, warning: "Account created, but confirmation email delivery failed. Use Resend verification to try again." }); }

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		if (error && typeof error === "object" && "code" in error && error.code === "P2002") throw new ApiError(409, "This email is already registered. Please sign in or reset your password.");
		console.error("Registration/Email error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}, {"limit":5});
