import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	try {
		// 1. Extract the email from the query parameters
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json([], { status: 400 });
		}

		// 2. Find the user
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return NextResponse.json([], { status: 404 });
		}

		// 3. Fetch history strictly for this user, ordered by newest first
		const history = await prisma.runHistory.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(history);
	} catch (error) {
		console.error("History fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch history" },
			{ status: 500 },
		);
	}
}
