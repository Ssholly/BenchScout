import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api";
import { ApiError } from "@/lib/security";
import { opportunityForPhase, listingDetails } from "@/lib/candidate-profile";
export const POST = withApi("candidate", async (request, session) => {
  const { jobId } = await request.json();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  if (!opportunityForPhase(job, session!.careerPhase || "licensed")) throw new ApiError(400, "This opportunity does not match your professional stage.");
  const deadline = listingDetails(job.listingDetails).deadline;
  if (deadline && deadline < new Date().toISOString().slice(0,10)) throw new ApiError(400, "The recorded application deadline has passed.");
  if (job.isDirectPost) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
    if (!user.resumeUrl) throw new ApiError(400, "Upload your CV in Settings before applying.");
    await prisma.application.upsert({ where: { jobId_userId: { jobId, userId: user.id } }, create: { jobId, userId: user.id }, update: {} });
  } else await prisma.job.update({ where: { id: jobId }, data: { applied: true, status: "applied" } });
  return NextResponse.json({ success: true });
}, { job: "available", limit: 20 });
export const DELETE = withApi("candidate", async (request, session) => {
  const { jobId } = await request.json();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  if (job.isDirectPost) await prisma.application.deleteMany({ where: { jobId, userId: session!.id } });
  else await prisma.job.update({ where: { id: jobId }, data: { applied: false, status: "active" } });
  return NextResponse.json({ success: true });
}, { job: "available" });
