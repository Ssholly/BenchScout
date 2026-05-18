import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const { email, token, newPassword } = await request.json();

		if (!email || !token || !newPassword) {
			return NextResponse.json(
				{ error: "Missing required fields." },
				{ status: 400 },
			);
		}

		// 1. Verify the token exists
		const resetRecord = await prisma.passwordResetToken.findUnique({
			where: { email },
		});

		if (!resetRecord || resetRecord.token !== token) {
			return NextResponse.json(
				{ error: "Invalid or expired reset token." },
				{ status: 400 },
			);
		}

		// 2. Check expiration
		if (new Date() > resetRecord.expiresAt) {
			await prisma.passwordResetToken.delete({ where: { email } });
			return NextResponse.json(
				{ error: "Reset token has expired. Please request a new one." },
				{ status: 400 },
			);
		}

		// 3. Hash the new password
		const salt = await bcrypt.genSalt(12);
		const passwordHash = await bcrypt.hash(newPassword, salt);

		// 4. Update User and Delete Token in a transaction
		await prisma.$transaction([
			prisma.user.update({
				where: { email },
				data: { password: passwordHash },
			}),
			prisma.passwordResetToken.delete({
				where: { email },
			}),
		]);

		return NextResponse.json({
			success: true,
			message: "Password updated successfully! You can now log in.",
		});
	} catch (error) {
		console.error("Password Reset Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
