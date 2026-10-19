import { applicationDocumentOptions } from "@/lib/application-documents";
import { withApi } from "@/lib/api";
import { ApiError, textField } from "@/lib/security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { candidateProfile } from "@/lib/candidate-profile";
import { sharedProfessionalSummary } from "@/lib/professional-summary";



// GET: Fetch the specific logged-in user by their email
export const GET = withApi("candidate", async (request: Request) => {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json({ error: "No email provided" }, { status: 400 });
		}

		// Look up the EXACT user by email, not just the first one
		const user = await prisma.user.findFirst({
			where: { email: email },
		});

		if (!user) {
			return NextResponse.json({ error: "No user found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, user, applicationDocuments: applicationDocumentOptions(user), professionalSummary: sharedProfessionalSummary(user), uploadsAvailable: Boolean(process.env.BLOB_PRIVATE_READ_WRITE_TOKEN) });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		console.error("Failed to fetch user:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user" },
			{ status: 500 },
		);
	}
}, {});

// POST: Update the specific user's settings when they click "Update Profile"
export const POST = withApi("candidate", async (request: Request) => {
	try {
		const body = await request.json();
		// 🚀 Added avatarUrl to the destructured payload
		const { name, email, location, keywords, minScore } = body;
		textField(name, "name");
		textField(location, "location");
		if (!Number.isInteger(minScore) || minScore < 0 || minScore > 100) throw new ApiError(400, "Match score must be between 0 and 100.");
		if (keywords != null && !(typeof keywords === "string" || (Array.isArray(keywords) && keywords.every(value => typeof value === "string")))) throw new ApiError(400, "Invalid keywords.");

		if (!email) {
			return NextResponse.json(
				{ success: false, error: "Email is required to update" },
				{ status: 400 },
			);
		}

		// 1. Find the specific user who is trying to update their settings
		const user = await prisma.user.findFirst({
			where: { email: email },
		});

		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found" },
				{ status: 404 },
			);
		}

		// 2. Update ONLY that specific user in the database
		await prisma.user.update({
			where: { id: user.id, credentialRevision: user.credentialRevision ?? 0 },
			data: {
				name: name,
                ...(user.name !== name ? {credentialRevision:{increment:1},licenseReviewRevision:null,isLicenseVerified:false,licenseReviewedAt:null,licenseReviewReference:null} : {}),
				location: location,
                ...(user.location !== location ? {candidateProfile:candidateProfile(user.candidateProfile)} : {}),
				// Safely handle keywords whether they arrive as an array or a string
				keywords: Array.isArray(keywords) ? keywords.join(", ") : keywords,
				minScore: minScore,
				// 🚀 Added avatarUrl mapping here

			},
		}).catch((error: unknown) => {
            if (error && typeof error === "object" && "code" in error && error.code === "P2025") throw new ApiError(409, "Your credential record changed. Refresh before saving your profile again.");
            throw error;
        });

		console.log("Successfully updated profile for:", email);
		return NextResponse.json({ success: true });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		console.error("Failed to update profile:", error);
		return NextResponse.json(
			{ success: false, error: "Database error" },
			{ status: 500 },
		);
	}
}, {});
