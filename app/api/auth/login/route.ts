import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const { email, password } = await request.json();

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
		return NextResponse.json({
			success: true,
			user: {
				name: user.name,
				email: user.email,
				location: user.location,
				keywords: user.keywords,
				minScore: user.minScore,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Internal server error." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
