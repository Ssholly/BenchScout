import { withApi } from "@/lib/api";
import { ApiError } from "@/lib/security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export const PUT = withApi("candidate", async (request: Request) => {
	try {
		const { jobId, status } = await request.json();
		if (!["saved", "declined", "applied", "interviewing", "interview", "offer", "rejected", "hired", "accepted"].includes(status)) throw new ApiError(400, "Invalid status.");

		// Update the job's column status in the database
		const updated = await prisma.job.updateMany({
			where: { id: jobId, isDirectPost: false },
			data: { status: status },
		});
		if (updated.count === 0) throw new ApiError(400, "Employer-posted application stages are managed by the employer. The vacancy was not changed.");

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		console.error("Failed to update job status:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update status" },
			{ status: 500 },
		);
	}
}, {"job":"candidate"});
