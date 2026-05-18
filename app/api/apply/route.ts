import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const { jobId } = await request.json();

		if (!jobId) {
			return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
		}

		const updatedJob = await prisma.job.update({
			where: { id: jobId },
			data: { applied: true },
		});

		return NextResponse.json(updatedJob);
	} catch (error) {
		console.error("Apply update error:", error);
		return NextResponse.json(
			{ error: "Failed to update job status" },
			{ status: 500 },
		);
	}
}

// 🚀 NEW: Handle reverting the application when canceled
export async function DELETE(request: Request) {
	try {
		const { jobId } = await request.json();

		if (!jobId) {
			return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
		}

		const updatedJob = await prisma.job.update({
			where: { id: jobId },
			data: { applied: false, status: "applied" }, // Reset applied boolean and status column
		});

		return NextResponse.json(updatedJob);
	} catch (error) {
		console.error("Cancel apply error:", error);
		return NextResponse.json(
			{ error: "Failed to cancel job application" },
			{ status: 500 },
		);
	}
}
