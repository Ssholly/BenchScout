import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api";
import { ApiError, textField } from "@/lib/security";
import { isPrivateBlob } from "@/lib/documents";
import { opportunityForPhase, listingDetails } from "@/lib/candidate-profile";
export const POST = withApi("candidate", async (request, session) => {
  const { jobId } = await request.json();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  if (!opportunityForPhase(job, session!.careerPhase || "licensed")) throw new ApiError(400, "This opportunity does not match your professional stage.");
  const deadline = listingDetails(job.listingDetails).deadline;
  if (deadline && deadline < new Date().toISOString().slice(0,10)) throw new ApiError(400, "The recorded application deadline has passed.");
  if (job.isDirectPost) {
    const employer = job.employerId ? await prisma.employer.findUnique({ where: { id: job.employerId }, select: { isVerified: true } }) : null;
    if (job.status !== "active" || !employer?.isVerified) throw new ApiError(403, "This vacancy is unavailable pending safety review.");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
    if (!user.resumeUrl || !isPrivateBlob(user.resumeUrl)) throw new ApiError(400, "Upload your CV to private storage in Settings before applying.");
    await prisma.application.upsert({ where: { jobId_userId: { jobId, userId: user.id } }, create: { jobId, userId: user.id }, update: {} });
  } else await prisma.job.update({ where: { id: jobId }, data: { applied: true, status: "applied" } });
  return NextResponse.json({ success: true });
}, { job: "available", limit: 20 });
export const DELETE = withApi("candidate", async (request, session) => {
  const jobId = textField((await request.json()).jobId, "job ID");
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new ApiError(404, "Job not found.");
  // Withdrawal follows application ownership, even if the vacancy is now paused/closed.
  if (job.isDirectPost) {
    const removed = await prisma.application.deleteMany({ where: { jobId, userId: session!.id } });
    if (!removed.count) throw new ApiError(404, "Application not found.");
  } else {
    if (job.userId !== session!.id) throw new ApiError(403, "You do not have access to this job.");
    await prisma.job.update({ where: { id: jobId }, data: { applied: false, status: "active" } });
  }
  return NextResponse.json({ success: true });
}, { limit: 20 });
