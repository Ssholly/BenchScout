import { applicationOrigin, ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";
import { emailField } from "@/lib/security";
import { accountRole, accountTokenKey, storedAccountToken } from "@/lib/account-tokens";




export const POST = withApi("public", async (request: Request) => {
	try {
		const body = await request.json();
		const email = emailField(body.email);
		const role = accountRole(body.role);
		const key = accountTokenKey(email, role);

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required." },
				{ status: 400 },
			);
		}

		const user = role === "employer" ? await prisma.employer.findUnique({ where: { email }, select: { id: true } }) : await prisma.user.findUnique({ where: { email }, select: { id: true } });

		// Security practice: Always say "link sent" even if email doesn't exist
		if (!user) {
			return NextResponse.json({
				success: true,
				message: "If an account exists, check your inbox for a reset link. You can retry if it does not arrive.",
			});
		}

		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hr expiry

		// Delete old tokens, insert new
		await prisma.$transaction([
			prisma.passwordResetToken.upsert({ where: { email: key }, create: { email: key, token: storedAccountToken(token), expiresAt }, update: { token: storedAccountToken(token), expiresAt } }),
		]);

		// Send the email with Resend
		const appUrl = applicationOrigin(request);
		const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}&role=${role}`;

		try { await sendPasswordResetEmail(email, resetLink); }
		catch { console.error("Password recovery email delivery failed; recipient can retry."); }

		return NextResponse.json({
			success: true,
			message: "If an account exists, check your inbox for a reset link. You can retry if it does not arrive.",
		});
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		console.error("Forgot Password Error:", error);
		return NextResponse.json(
			{ error: "Internal server error." },
			{ status: 500 },
		);
	}
}, {"limit":5});
