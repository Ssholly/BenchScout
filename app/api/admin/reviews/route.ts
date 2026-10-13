import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ApiError, emailField, textField } from "@/lib/security";
import { candidateProfile, listingDetails, opportunityType } from "@/lib/candidate-profile";
export const POST = withApi("admin", async request => {
  const body = await request.json();
  const email = body.kind === "internship" ? "" : emailField(body.email);
  const reference = textField(body.reference, "review evidence or reference", 2000);
  if (reference.length < 10 || typeof body.approved !== "boolean") throw new ApiError(400, "Record the review evidence and an explicit decision.");
  if (body.kind === "internship") {
    const jobId = textField(body.jobId, "vacancy ID");
    const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
    if (opportunityType(job) !== "internship") throw new ApiError(400, "Choose an internship placement.");
    if (body.approved && !/^https:\/\/(?:[\w-]+\.)*mlscn\.gov\.ng\//.test(reference)) throw new ApiError(400, "Record the official MLSCN source for this institution’s internship programme.");
    await prisma.job.update({ where: { id: jobId }, data: { isMlscnApproved: body.approved, listingDetails: { ...listingDetails(job.listingDetails), approvalSource: body.approved ? reference : "", approvalReviewedAt: body.approved ? new Date().toISOString() : "" } } });
  } else if (body.kind === "employer") {
    await prisma.employer.update({ where: { email }, data: { isVerified: body.approved, verifiedAt: body.approved ? new Date() : null, verificationReference: reference } });
  } else if (body.kind === "candidate") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(404, "Candidate not found.");
    const profile = candidateProfile(user.candidateProfile);
    const complete = user.careerPhase === "internship" ? user.provisionalUrl && profile.provisionalNumber && (!profile.provisionalExpiry || new Date(profile.provisionalExpiry) >= new Date()) : user.licenseNumber && user.licenseUrl && user.licenseExpiry && user.licenseExpiry > new Date();
    if (body.approved && !complete) throw new ApiError(400, "Record the candidate’s relevant license document and valid registration details before approval.");
    await prisma.user.update({ where: { id: user.id }, data: { isLicenseVerified: body.approved, licenseReviewedAt: body.approved ? new Date() : null, licenseReviewReference: reference } });
  } else throw new ApiError(400, "Choose candidate, employer or internship-site review.");
  return NextResponse.json({ success: true });
}, { limit: 20 });
