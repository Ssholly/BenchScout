import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const { jobId, email } = await request.json();

		if (!jobId) {
			return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
		}

		const job = await prisma.job.findUnique({ where: { id: jobId } });
		if (!job)
			return NextResponse.json({ error: "Job not found" }, { status: 404 });

		// 🚀 B2B ATS ROUTING: Drop candidate into the Employer's Inbox
		if (job.isDirectPost) {
			if (!email)
				return NextResponse.json(
					{ error: "Email required for B2B apply" },
					{ status: 400 },
				);

			const user = await prisma.user.findUnique({ where: { email } });
			if (!user)
				return NextResponse.json({ error: "User not found" }, { status: 404 });

			await prisma.application.create({
				data: {
					jobId: job.id,
					userId: user.id,
				},
			});
			return NextResponse.json({
				success: true,
				message: "ATS Application Logged",
			});
		}

		// 🚀 STANDARD BEHAVIOR: Flip the boolean on their personal scraped job
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
	} finally {
		await prisma.$disconnect();
	}
}

export async function DELETE(request: Request) {
	// Legacy support for undoing standard applications
	try {
		const { jobId } = await request.json();
		if (!jobId)
			return NextResponse.json({ error: "Missing jobId" }, { status: 400 });

		const updatedJob = await prisma.job.update({
			where: { id: jobId },
			data: { applied: false, status: "applied" },
		});
		return NextResponse.json(updatedJob);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to cancel job application" },
			{ status: 500 },
		);
	}
}
