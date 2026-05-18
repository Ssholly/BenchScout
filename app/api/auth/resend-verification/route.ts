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

		if (!user) {
			return NextResponse.json(
				{ error: "Account not found." },
				{ status: 404 },
			);
		}

		if (user.isVerified) {
			return NextResponse.json(
				{ error: "This account is already verified. You can log in." },
				{ status: 400 },
			);
		}

		// Generate a fresh token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		// Delete old tokens and save the new one
		await prisma.$transaction([
			prisma.verificationToken.deleteMany({ where: { email } }),
			prisma.verificationToken.create({ data: { email, token, expiresAt } }),
		]);

		const appUrl =
			process.env.NEXT_PUBLIC_APP_URL || "https://bench-scout.vercel.app";
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

		const { error } = await resend.emails.send({
			from: "BenchScout <onboarding@resend.dev>",
			to: email,
			subject: "Confirm your BenchScout account (Resent)",
			html: emailHtml,
		});

		if (error) {
			return NextResponse.json(
				{ error: `Email blocked by provider: ${error.message}` },
				{ status: 400 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "A new verification link has been sent.",
		});
	} catch (error) {
		console.error("Resend Verification Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
