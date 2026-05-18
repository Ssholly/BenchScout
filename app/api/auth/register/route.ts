import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const resume = formData.get("resume") as File;

		if (!name || !email || !password || !resume) {
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

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const keywords = "Hematology, Clinical Diagnostics, Quality Control";

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				keywords,
				location: "FCT - Abuja",
				isVerified: false,
			},
		});

		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		await prisma.verificationToken.create({
			data: { email, token, expiresAt },
		});

		const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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

		// 🚀 Catch Resend API Errors specifically
		const { error } = await resend.emails.send({
			from: "BenchScout <onboarding@resend.dev>",
			to: email,
			subject: "Confirm your BenchScout account",
			html: emailHtml,
		});

		if (error) {
			console.error("Resend Error:", error);
			// We still registered the user, but we warn them the email failed
			return NextResponse.json({
				success: true,
				warning: `Account created, but email failed: ${error.message}`,
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Registration/Email error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
