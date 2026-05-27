import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🚀 POST HANDLER: Captures the user clicking "Confirm & Activate" inside the layout view
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email, licenseNumber, expiryDate } = body;

		if (!email || !licenseNumber || !expiryDate) {
			return NextResponse.json(
				{ error: "Missing identity tracking vectors" },
				{ status: 400 },
			);
		}

		// 🚀 DATABASE PARSING FIX: Safely translate textual timestamps into true PostgreSQL compliant Date objects
		const formattedDate = new Date(expiryDate);
		if (isNaN(formattedDate.getTime())) {
			return NextResponse.json(
				{ error: "Invalid date format parsed from card" },
				{ status: 400 },
			);
		}

		const user = await prisma.user.update({
			where: { email },
			data: {
				licenseNumber,
				licenseExpiry: formattedDate,
				isLicenseVerified: true,
			},
		});

		return NextResponse.json({ success: true, user });
	} catch (error: any) {
		console.error("Compliance registration error:", error);
		return NextResponse.json(
			{
				error:
					error.message ||
					"Failed to finalize structural compliance properties.",
			},
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

// 🚀 GET HANDLER: Calculates dates and tracks parameters for the frontend dashboard
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json(
				{ error: "Active authentication required" },
				{ status: 400 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				licenseExpiry: true,
				licenseNumber: true,
				cpdPoints: true,
				isLicenseVerified: true,
				name: true,
			},
		});

		if (!user || !user.licenseExpiry) {
			return NextResponse.json({ status: "UNCONFIGURED" });
		}

		const expiryDate = new Date(user.licenseExpiry);
		const today = new Date();
		const timeDifference = expiryDate.getTime() - today.getTime();
		const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

		let status = "VALID";
		if (remainingDays <= 0) status = "EXPIRED";
		else if (remainingDays <= 90) status = "WARNING";

		const REQUIRED_CPD = 30;
		const cpdProgress = Math.min(
			Math.round((user.cpdPoints / REQUIRED_CPD) * 100),
			100,
		);

		return NextResponse.json({
			success: true,
			status,
			daysLeft: remainingDays,
			expiryFormatted: expiryDate.toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
			}),
			licenseNumber: user.licenseNumber,
			cpdPoints: user.cpdPoints,
			cpdPercent: cpdProgress,
			isVerified: user.isLicenseVerified,
			name: user.name,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
}
