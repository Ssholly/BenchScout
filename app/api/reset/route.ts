import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email } = body;

		if (!email) {
			return NextResponse.json(
				{ error: "Missing user email" },
				{ status: 400 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Execute the wipe and hide safely in a transaction
		await prisma.$transaction([
			// 1. Wipe the history logs for this user
			prisma.runHistory.deleteMany({
				where: { userId: user.id },
			}),

			// 2. Hide matches from the UI without deleting them from the Database!
			// 🚀 THE FIX: We use status: "cleared". This preserves the Tier and Salary for Market Intelligence!
			prisma.job.updateMany({
				where: {
					userId: user.id,
					applied: false,
				},
				data: {
					status: "cleared",
				},
			}),
		]);

		return NextResponse.json({
			success: true,
			message: "History cleared and matches hidden successfully.",
		});
	} catch (error) {
		console.error("Reset history error:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to reset history and matches" },
			{ status: 500 },
		);
	}
}
