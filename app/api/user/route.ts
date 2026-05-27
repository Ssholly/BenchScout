import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch the specific logged-in user by their email
export async function GET(request: Request) {
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

		return NextResponse.json({ success: true, user });
	} catch (error) {
		console.error("Failed to fetch user:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

// POST: Update the specific user's settings when they click "Update Profile"
export async function POST(request: Request) {
	try {
		const body = await request.json();
		// 🚀 Added avatarUrl to the destructured payload
		const { name, email, location, keywords, minScore, avatarUrl } = body;

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
			where: { id: user.id },
			data: {
				name: name,
				location: location,
				// Safely handle keywords whether they arrive as an array or a string
				keywords: Array.isArray(keywords) ? keywords.join(", ") : keywords,
				minScore: minScore,
				// 🚀 Added avatarUrl mapping here
				avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
			},
		});

		console.log("Successfully updated profile for:", email);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to update profile:", error);
		return NextResponse.json(
			{ success: false, error: "Database error" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
