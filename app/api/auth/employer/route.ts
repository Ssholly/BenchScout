import { ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startSession } from "@/lib/auth";
import { emailField, passwordField, textField } from "@/lib/security";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { accountTokenKey, storedAccountToken } from "@/lib/account-tokens";
import { sendVerificationEmail } from "@/lib/verification-email";



export const POST = withApi("public", async (request: Request) => {
	try {
		const body = await request.json();
		const { action, contactName } = body;
		const email = emailField(body.email);
		if (typeof body.password !== "string" || !body.password || Buffer.byteLength(body.password) > 72) throw new ApiError(400, "Invalid password.");
		const password = body.password;
		const companyName = action === "register" ? textField(body.companyName, "company name") : "";

		if (action === "register") {
			if (!companyName || !email || !password) {
				return NextResponse.json(
					{ success: false, error: "Missing required fields." },
					{ status: 400 },
				);
			}

			const existingEmployer = await prisma.employer.findUnique({
				where: { email },
			});
			if (existingEmployer) {
				return NextResponse.json(
					{
						success: false,
						error: "An account with this email already exists.",
					},
					{ status: 400 },
				);
			}

			const passwordHash = await bcrypt.hash(passwordField(password), 12);
			const token = crypto.randomBytes(32).toString("hex");
			await prisma.$transaction([prisma.employer.create({
				data: {
					companyName,
					email,
					passwordHash,
					contactName: contactName ? textField(contactName, "contact name") : null,
					emailVerificationRequired: true,
				},
			}), prisma.verificationToken.create({ data: { email: accountTokenKey(email, "employer"), token: storedAccountToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } })]);
			let warning: string | undefined;
			try { await sendVerificationEmail(request, email, token, "employer"); }
			catch { warning = "Account created, but confirmation email delivery failed. Use Resend confirmation to try again."; }

			return NextResponse.json({
				success: true,
				requiresEmailVerification: true,
				message: "Account created. Confirm your email before signing in.",
				warning,
			});
		}

		if (action === "login") {
			if (!email || !password) {
				return NextResponse.json(
					{ success: false, error: "Missing email or password." },
					{ status: 400 },
				);
			}

			const employer = await prisma.employer.findUnique({ where: { email } });
			if (!employer) {
				return NextResponse.json(
					{ success: false, error: "Invalid login credentials." },
					{ status: 401 },
				);
			}

			const isPasswordValid = await bcrypt.compare(
				password,
				employer.passwordHash,
			);
			if (!isPasswordValid) {
				return NextResponse.json(
					{ success: false, error: "Invalid login credentials." },
					{ status: 401 },
				);
			}
			if (employer.emailVerificationRequired && !employer.emailVerifiedAt) throw new ApiError(403, "Confirm your email before signing in. Use Resend confirmation if you need a new link.");

			return startSession(NextResponse.json({
				success: true,
				employer: {
					id: employer.id,
					companyName: employer.companyName,
					email: employer.email,
					isVerified: employer.isVerified,
				},
			}), request, employer.id, "employer");
		}

		return NextResponse.json(
			{ success: false, error: "Invalid action parameter." },
			{ status: 400 },
		);
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		if (error && typeof error === "object" && "code" in error && error.code === "P2002") throw new ApiError(409, "An account with that email or company name already exists.");
		console.error("B2B AUTH ERROR:", error);
		return NextResponse.json(
			{ success: false, error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}, {});
