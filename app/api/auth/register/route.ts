import { ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { emailField, passwordField, textField } from "@/lib/security";
import { validateDocument, storeDocument, removeDocument, resumeText } from "@/lib/documents";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/verification-email";
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

    try { await sendVerificationEmail(request, email, token, "candidate"); }
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
