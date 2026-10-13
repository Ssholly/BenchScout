import { ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export const GET = withApi("admin", async () => {
	try {




		// Identify Admin Injections by looking for Global Tier 1 / Score 99 roles
		const jobs = await prisma.job.findMany({
			where: { source: "Admin", isDirectPost: false },
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
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		return NextResponse.json(
			{ error: "Failed to fetch jobs." },
			{ status: 500 },
		);
	}
}, {});

export const PATCH = withApi("admin", async (request: Request) => {
	try {
		const body = await request.json();
		const { oldRole, oldCompany, role, company, loc, url, salary, skills } = body;


		// Update ALL copies of this globally injected job across every user's feed
		const updated = await prisma.job.updateMany({
			where: {
				role: oldRole,
				company: oldCompany,
				source: "Admin",
				isDirectPost: false,
			},
			data: { role, company, loc, url, salary, skills },
		});

		return NextResponse.json({ success: true, count: updated.count });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		return NextResponse.json(
			{ error: "Failed to update jobs." },
			{ status: 500 },
		);
	}
}, {});

export const DELETE = withApi("admin", async (request: Request) => {
	try {
		const body = await request.json();
		const { role, company } = body;


		// Wipe this specific job from EVERY candidate's feed simultaneously
		const deleted = await prisma.job.deleteMany({
			where: { role, company, source: "Admin", isDirectPost: false },
		});

		return NextResponse.json({ success: true, count: deleted.count });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		return NextResponse.json(
			{ error: "Failed to delete jobs." },
			{ status: 500 },
		);
	}
}, {});
