import { currentCredentialReview } from "@/lib/credential-review";
import { ApiError, textField } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



// 🚀 POST HANDLER: Captures the user clicking "Confirm & Activate" inside the layout view
export const POST = withApi("candidate", async (request: Request) => {
	try {
		const body = await request.json();
		const { email, expiryDate } = body;
		const licenseNumber = textField(body.licenseNumber, "license number", 100);

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
				isLicenseVerified: false,
				licenseReviewedAt: null,
				licenseReviewReference: null,
                licenseReviewRevision: null,
                credentialRevision: { increment: 1 },
			},
		});

		return NextResponse.json({ success: true, user });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		console.error("Compliance registration error:", error);
		return NextResponse.json(
			{
				error:
					(error instanceof Error ? error.message : "Request failed") ||
					"Failed to finalize structural compliance properties.",
			},
			{ status: 500 },
		);
	}
}, {});

// 🚀 GET HANDLER: Calculates dates and tracks parameters for the frontend dashboard
export const GET = withApi("candidate", async (request: Request) => {
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
				licenseReviewedAt: true,
                credentialRevision: true, licenseReviewRevision: true, careerPhase: true, candidateProfile: true,
				name: true,
			},
		});

		if (!user || !user.licenseExpiry) {
			return NextResponse.json({ success: true, status: "UNCONFIGURED" });
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
			isVerified: currentCredentialReview(user),
			verificationStatus: currentCredentialReview(user) ? "reviewed" : "self_reported",
			name: user.name,
		});
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		return NextResponse.json({ error: (error instanceof Error ? error.message : "Request failed") }, { status: 500 });
	}
}, {});
