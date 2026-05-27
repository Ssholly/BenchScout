import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json(
				{ error: "Active authentication identity required" },
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
				avatarUrl: true,
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

		// MLSCN baseline credential tracking constraints
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
			avatarUrl: user.avatarUrl,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
