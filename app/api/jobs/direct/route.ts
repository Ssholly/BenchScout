import { ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingDetails } from "@/lib/candidate-profile";



export const POST = withApi("employer", async (request: Request, session: import("@/lib/auth").Session | null) => {
	try {
		const body = await request.json();
		const { role, company, loc, salary, skills, jobType, employerId } = body;
        if (jobType && !["full-time", "internship", "locum", "contract", "part-time"].includes(jobType)) throw new ApiError(400, "Choose a valid vacancy type.");
        const deadline = typeof body.deadline === "string" ? body.deadline : "";
        if (deadline && (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) || !Number.isFinite(Date.parse(deadline)) || new Date(deadline).toISOString().slice(0,10) !== deadline)) throw new ApiError(400, "Enter a valid application deadline.");
        const requiredDocuments = typeof body.requiredDocuments === "string" ? body.requiredDocuments.trim() : "";
        if (requiredDocuments.length > 500) throw new ApiError(400, "Document requirements must be 500 characters or fewer.");

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
				company: session!.name,
				loc,
				salary: salary || "Competitive",
				skills,
				url: `/matches/direct/${employerId}`, // Required field restored!
				score: 0,
				tier: jobType === "internship" ? 2 : 1,
				status: "active",
				applied: false,
				jobType: jobType || "full-time",
				isMlscnApproved: false,
                listingDetails: { deadline, requiredDocuments },
				isDirectPost: true,
				employerId,
			},
		});

		return NextResponse.json({
			success: true,
			job: directJob,
			message: "Global broadcast successfully deployed.",
		});
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		console.error("DIRECT POST ERROR:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Database rejected the global broadcast structural payload.",
			},
			{ status: 500 },
		);
	}
}, {"verifiedEmployer":true});

// 🚀 HANDLE EDITING EXISTING BROADCASTS
export const PATCH = withApi("employer", async (request: Request) => {
	try {
		const body = await request.json();
		const { jobId, role, loc, salary, skills } = body;

		if (!jobId) {
			return NextResponse.json({ error: "Missing Job ID" }, { status: 400 });
		}

        const previous = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
        const details = listingDetails(previous.listingDetails);
        if (body.deadline !== undefined) {
          if (typeof body.deadline !== "string" || (body.deadline && (!/^\d{4}-\d{2}-\d{2}$/.test(body.deadline) || !Number.isFinite(Date.parse(body.deadline)) || new Date(body.deadline).toISOString().slice(0,10) !== body.deadline))) throw new ApiError(400, "Enter a valid application deadline.");
          details.deadline = body.deadline;
        }
        if (body.requiredDocuments !== undefined) {
          if (typeof body.requiredDocuments !== "string" || body.requiredDocuments.length > 500) throw new ApiError(400, "Invalid document requirements.");
          details.requiredDocuments = body.requiredDocuments.trim();
        }
		// Update the specific job row with new details
		const updatedJob = await prisma.job.update({
			where: { id: jobId },
			data: {
				role,
				loc,
				salary: salary || "Competitive",
				skills,
                listingDetails: { ...details },
			},
		});

		return NextResponse.json({ success: true, job: updatedJob });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		console.error("Edit Broadcast Error:", error);
		return NextResponse.json(
			{ error: "Failed to update broadcast" },
			{ status: 500 },
		);
	}
}, {"job":"employer","verifiedEmployer":true});

export const DELETE = withApi("employer", async (request: Request) => {
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
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		console.error("DELETE POST ERROR:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete broadcast." },
			{ status: 500 },
		);
	}
}, {"job":"employer"});
