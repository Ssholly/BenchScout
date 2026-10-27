import { ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startSession } from "@/lib/auth";
import { emailField } from "@/lib/security";
import bcrypt from "bcryptjs";



export const POST = withApi("public", async (request: Request) => {
	try {
		const body = await request.json();
		const email = emailField(body.email);
		if (typeof body.password !== "string" || !body.password || Buffer.byteLength(body.password) > 72) throw new ApiError(400, "Invalid password.");
		const password = body.password;

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Missing email or password." },
				{ status: 400 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 },
			);
		}

		// 1. Verify the password hash
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 },
			);
		}

		// 2. Check if the email has been confirmed
		if (!user.isVerified) {
			return NextResponse.json(
				{
					error:
						"Please verify your email address before logging in. Check your inbox for the confirmation link.",
				},
				{ status: 403 },
			);
		}

		// 3. Success! Return safe user data (NEVER return the password hash)
		return startSession(NextResponse.json({
			success: true,
			user: {
				id: user.id,
				careerPhase: user.careerPhase,
				name: user.name,
				email: user.email,
				location: user.location,
				keywords: user.keywords,
				minScore: user.minScore,
			},
		}), request, user.id, "candidate");
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Internal server error." },
			{ status: 500 },
		);
	}
}, {});
