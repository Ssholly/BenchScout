import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			role,
			company,
			loc,
			salary,
			skills,
			jobType,
			isMlscnApproved,
			employerId,
		} = body;

		if (!role || !company || !loc || !skills || !employerId) {
			return NextResponse.json(
				{ success: false, error: "Missing parameters." },
				{ status: 400 },
			);
		}

		// 🚀 ONE ROW POST: Completely independent global corporate placement
		const directJob = await prisma.job.create({
			data: {
				userId: null, // 🚀 Explicitly null means it's broadcast globally to everyone!
				role,
				company,
				loc,
				salary: salary || "Competitive",
				skills,
				url: `/matches/direct/${employerId}`, // Required field restored!
				score: 95,
				tier: jobType === "internship" ? 2 : 1,
				status: "active",
				applied: false,
				jobType: jobType || "full-time",
				isMlscnApproved: isMlscnApproved || false,
				isDirectPost: true,
				employerId,
			},
		});

		return NextResponse.json({
			success: true,
			job: directJob,
			message: "Global broadcast successfully deployed.",
		});
	} catch (error: any) {
		console.error("DIRECT POST ERROR:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Database rejected the global broadcast structural payload.",
			},
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

// 🚀 HANDLE EDITING EXISTING BROADCASTS
export async function PATCH(request: Request) {
	try {
		const body = await request.json();
		const { jobId, role, loc, salary, skills } = body;

		if (!jobId) {
			return NextResponse.json({ error: "Missing Job ID" }, { status: 400 });
		}

		// Update the specific job row with new details
		const updatedJob = await prisma.job.update({
			where: { id: jobId },
			data: {
				role,
				loc,
				salary: salary || "Competitive",
				skills,
			},
		});

		return NextResponse.json({ success: true, job: updatedJob });
	} catch (error: any) {
		console.error("Edit Broadcast Error:", error);
		return NextResponse.json(
			{ error: "Failed to update broadcast" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function DELETE(request: Request) {
	try {
		const body = await request.json();
		const { jobId, employerId } = body;

		if (!jobId || !employerId) {
			return NextResponse.json(
				{ success: false, error: "Missing parameters." },
				{ status: 400 },
			);
		}

		// Securely delete the job only if it belongs to this employer
		await prisma.job.deleteMany({
			where: {
				id: jobId,
				employerId: employerId,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Broadcast terminated.",
		});
	} catch (error: any) {
		console.error("DELETE POST ERROR:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete broadcast." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
