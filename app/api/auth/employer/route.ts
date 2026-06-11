import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { action, companyName, email, password, contactName } = body;

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

			const passwordHash = await bcrypt.hash(password, 10);
			const newEmployer = await prisma.employer.create({
				data: {
					companyName,
					email,
					passwordHash,
					contactName: contactName || null,
				},
			});

			return NextResponse.json({
				success: true,
				message: "Registration successful!",
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

			return NextResponse.json({
				success: true,
				employer: {
					id: employer.id,
					companyName: employer.companyName,
					email: employer.email,
					isVerified: employer.isVerified,
				},
			});
		}

		return NextResponse.json(
			{ success: false, error: "Invalid action parameter." },
			{ status: 400 },
		);
	} catch (error: any) {
		console.error("B2B AUTH ERROR:", error);
		return NextResponse.json(
			{ success: false, error: "Internal Server Error" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
