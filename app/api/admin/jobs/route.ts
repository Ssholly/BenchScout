import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const passcode = searchParams.get("passcode");

		if (passcode !== (process.env.CRON_SECRET || "admin123")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Identify Admin Injections by looking for Global Tier 1 / Score 99 roles
		const jobs = await prisma.job.findMany({
			where: { score: 99, tier: 1, isDirectPost: false },
			distinct: ["role", "company"],
			select: {
				role: true,
				company: true,
				loc: true,
				url: true,
				salary: true,
				skills: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json({ success: true, jobs });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch jobs." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function PATCH(request: Request) {
	try {
		const body = await request.json();
		const {
			passcode,
			oldRole,
			oldCompany,
			role,
			company,
			loc,
			url,
			salary,
			skills,
		} = body;

		if (passcode !== (process.env.CRON_SECRET || "admin123")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Update ALL copies of this globally injected job across every user's feed
		const updated = await prisma.job.updateMany({
			where: {
				role: oldRole,
				company: oldCompany,
				score: 99,
				tier: 1,
				isDirectPost: false,
			},
			data: { role, company, loc, url, salary, skills },
		});

		return NextResponse.json({ success: true, count: updated.count });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to update jobs." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function DELETE(request: Request) {
	try {
		const body = await request.json();
		const { passcode, role, company } = body;

		if (passcode !== (process.env.CRON_SECRET || "admin123")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Wipe this specific job from EVERY candidate's feed simultaneously
		const deleted = await prisma.job.deleteMany({
			where: { role, company, score: 99, tier: 1, isDirectPost: false },
		});

		return NextResponse.json({ success: true, count: deleted.count });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to delete jobs." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
