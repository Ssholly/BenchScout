import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required." },
				{ status: 400 },
			);
		}

		const user = await prisma.user.findUnique({ where: { email } });

		// Security practice: Always say "link sent" even if email doesn't exist
		if (!user) {
			return NextResponse.json({
				success: true,
				message: "If an account exists, a reset link has been sent.",
			});
		}

		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hr expiry

		// Delete old tokens, insert new
		await prisma.$transaction([
			prisma.passwordResetToken.deleteMany({ where: { email } }),
			prisma.passwordResetToken.create({ data: { email, token, expiresAt } }),
		]);

		// Send the email with Resend
		const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

		const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; text-align: center;">
        <div style="width: 48px; height: 48px; background-color: #0f172a; border-radius: 12px; margin: 0 auto 24px auto; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 24px; font-weight: bold; font-family: monospace;">B</span>
        </div>
        <h1 style="color: #0f172a; font-size: 26px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.5px;">Reset your password</h1>
        <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 auto 32px auto; max-width: 400px;">
          We received a request to reset the password for your BenchScout account. Click the button below to set a new password.
        </p>
        <a href="${resetLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-top: 40px;">
          If you didn't request this, you can safely ignore this email. Your password will remain unchanged. This link will expire in 1 hour.
        </p>
      </div>
    `;

		await resend.emails.send({
			from: "BenchScout <onboarding@resend.dev>", // Free tier verified sender
			to: email,
			subject: "Reset your BenchScout password",
			html: emailHtml,
		});

		return NextResponse.json({
			success: true,
			message: "If an account exists, a reset link has been sent.",
		});
	} catch (error) {
		console.error("Forgot Password Error:", error);
		return NextResponse.json(
			{ error: "Internal server error." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
