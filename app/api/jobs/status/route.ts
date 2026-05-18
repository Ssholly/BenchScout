import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
	try {
		const { jobId, status } = await request.json();

		// Update the job's column status in the database
		await prisma.job.update({
			where: { id: jobId },
			data: { status: status },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to update job status:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update status" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
