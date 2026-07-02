import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { passcode, role, company, loc, url, salary, skills } = body;

		// 🔒 Security check
		if (passcode !== (process.env.CRON_SECRET || "admin123")) {
			return NextResponse.json(
				{ error: "Unauthorized. Invalid Admin Passcode." },
				{ status: 401 },
			);
		}

		if (!role || !company || !loc) {
			return NextResponse.json(
				{ error: "Missing required parameters." },
				{ status: 400 },
			);
		}

		// 🚀 FETCH ALL USERS ON THE PLATFORM
		const users = await prisma.user.findMany();

		if (users.length === 0) {
			return NextResponse.json(
				{ error: "No users exist in the database to receive this job." },
				{ status: 400 },
			);
		}

		// 🚀 BLAST TO EVERYONE'S FEED AT ONCE (Tier 1, Score 99)
		const jobPayloads = users.map((user) => ({
			userId: user.id, // This ensures it actually shows up on their match feed!
			role,
			company,
			loc,
			url: url || "#",
			salary: salary || "Competitive",
			skills: skills || "Medical Laboratory Scientist",
			isDirectPost: false,
			score: 99,
			tier: 1,
			status: "active",
		}));

		await prisma.job.createMany({ data: jobPayloads });

		return NextResponse.json({ success: true, injectedCount: users.length });
	} catch (error) {
		console.error("Admin Injection Error:", error);
		return NextResponse.json(
			{ error: "Failed to inject job into network." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
