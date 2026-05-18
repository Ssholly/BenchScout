import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			email,
			jobAlertsEnabled,
			targetLocation,
			alertKeywords,
			alertTier,
		} = body;

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Update the user's automation preferences in the database
		// Update the user's automation preferences in the database
		const updatedUser = await prisma.user.update({
			where: { email },
			data: {
				alertsActive: jobAlertsEnabled || false, // <-- Mapped to your actual schema
				location: targetLocation || "All", // <-- Mapped to your actual schema
				alertKeywords: alertKeywords || "",
				alertTier: alertTier || "Tier 1 Only",
			},
		});

		return NextResponse.json({ success: true, user: updatedUser });
	} catch (error: any) {
		console.error("Failed to save preferences:", error);
		return NextResponse.json(
			{ error: "Failed to update preferences" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
