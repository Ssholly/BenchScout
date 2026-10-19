import { restrictApplicantDocuments } from "@/lib/application-documents";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api";
import { ApiError, textField } from "@/lib/security";
import { opportunityForPhase, candidateProfile } from "@/lib/candidate-profile";
import { currentCredentialReview } from "@/lib/credential-review";
import { sharedProfessionalSummary } from "@/lib/professional-summary";
// Candidate documents and contact details are visible only after an application.
export const GET = withApi("employer", async (request, session) => {
  const location = new URL(request.url).searchParams.get("location") || "";
  const users = await prisma.user.findMany({
    where: { applications: { some: { job: { employerId: session!.id } } }, ...(location ? { location: { contains: location, mode: "insensitive" as const } } : {}) },
    select: { id: true, name: true, email: true, location: true, careerPhase: true, candidateProfile: true, applications: { where: { job: { employerId: session!.id } }, select: { documentSelection: true } }, provisionalUrl: true, licenseUrl: true, degreeUrl: true, resumeUrl: true, isLicenseVerified: true, licenseReviewedAt: true, credentialRevision: true, licenseReviewRevision: true, licenseExpiry: true },
    orderBy: { name: "asc" }, take: 100,
  });
  return NextResponse.json({ success: true, users: users.map(({candidateProfile: profile,applications,...user})=>({...restrictApplicantDocuments(user,applications.map(application=>application.documentSelection)),professionalSummary:sharedProfessionalSummary({...user,candidateProfile:profile}),isLicenseVerified:currentCredentialReview({...user,candidateProfile:profile}),placementStage: user.careerPhase === "internship" ? candidateProfile(profile).placementStage : undefined})) });
}, { verifiedEmployer: true });
export const POST = withApi("employer", async (request, session) => {
  const body = await request.json();
  const candidateId = textField(body.candidateId, "candidate ID");
  const prior = await prisma.application.findFirst({ where: { userId: candidateId, job: { employerId: session!.id } }, select: { id: true } });
  if (!prior) throw new ApiError(403, "You can invite candidates who have applied to your organization.");
  const job = await prisma.job.findUniqueOrThrow({ where: { id: body.jobId } });
  if (job.status !== "active") throw new ApiError(400, "This vacancy is no longer active.");
  const candidate = await prisma.user.findUniqueOrThrow({ where: { id: candidateId }, select: { careerPhase: true } });
  if (!opportunityForPhase(job, candidate.careerPhase)) throw new ApiError(400, "Choose a vacancy that matches this candidate’s professional stage.");
  const notification = await prisma.notification.create({ data: { userId: candidateId, title: "Exclusive Recruitment Invitation", message: `${session!.name} invited you to apply for ${job.role}. Review the vacancy in your job matches.` } });
  return NextResponse.json({ success: true, createdAt: notification.createdAt });
}, { job: "employer", verifiedEmployer: true, limit: 10 });
