import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const { email, token } = await request.json();

		if (!email || !token) {
			return NextResponse.json(
				{ error: "Missing email or token." },
				{ status: 400 },
			);
		}

		// 1. Find the token in the database
		const verificationRecord = await prisma.verificationToken.findUnique({
			where: { email },
		});

		if (!verificationRecord) {
			return NextResponse.json(
				{ error: "Invalid or expired token." },
				{ status: 400 },
			);
		}

		// 2. Check if it matches and hasn't expired
		if (verificationRecord.token !== token) {
			return NextResponse.json({ error: "Invalid token." }, { status: 400 });
		}

		if (new Date() > verificationRecord.expiresAt) {
			// Delete the expired token
			await prisma.verificationToken.delete({ where: { email } });
			return NextResponse.json(
				{ error: "Token has expired. Please register again." },
				{ status: 400 },
			);
		}

		// 3. Success! Update the user and delete the token in a transaction
		await prisma.$transaction([
			prisma.user.update({
				where: { email },
				data: { isVerified: true },
			}),
			prisma.verificationToken.delete({
				where: { email },
			}),
		]);

		return NextResponse.json({
			success: true,
			message: "Email verified successfully! You can now log in.",
		});
	} catch (error) {
		console.error("Verification Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
