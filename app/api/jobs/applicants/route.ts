import { restrictApplicantDocuments, selectedDocumentKinds } from "@/lib/application-documents";
import { sendEmail } from "@/lib/mailer";
import { escapeHtml } from "@/lib/security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api";
import { ApiError, textField } from "@/lib/security";
import { candidateProfile } from "@/lib/candidate-profile";
import { currentCredentialReview } from "@/lib/credential-review";
import { sharedProfessionalSummary } from "@/lib/professional-summary";
import { interviewScheduleError } from "@/lib/interview-schedule";
export const GET = withApi("employer", async request => {
  const jobId = new URL(request.url).searchParams.get("jobId")!;
  const applications = await prisma.application.findMany({ where: { jobId }, include: { user: { select: {
    id: true, name: true, email: true, location: true, careerPhase: true, candidateProfile: true, licenseUrl: true, provisionalUrl: true, degreeUrl: true, statementOfResultUrl: true, resumeUrl: true, placementLetterUrl: true, certificateUrl: true, isLicenseVerified: true, licenseReviewedAt: true, credentialRevision: true, licenseReviewRevision: true, licenseExpiry: true,
  } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, applications: applications.map(application=>{const {candidateProfile:profile,location,...user}=application.user;const {documentSelection,...record}=application;return {...record,selectedDocumentKinds:selectedDocumentKinds(documentSelection),user:{...restrictApplicantDocuments(user,[documentSelection],application.id),professionalSummary:sharedProfessionalSummary({...user,location,candidateProfile:profile}),isLicenseVerified:currentCredentialReview(application.user),placementStage:user.careerPhase === "internship" ? candidateProfile(profile).placementStage : undefined}};}) });
}, { job: "employer", verifiedEmployer: true });
export const DELETE = withApi("employer", async () => {
  throw new ApiError(409, "Application history cannot be cleared here. Close the vacancy or update individual application statuses.");
}, { job: "employer", verifiedEmployer: true });
export const PATCH = withApi("employer", async request => {
  const { applicationId, status, interviewDate, interviewTime, interviewLoc } = await request.json();
  if (!["pending", "shortlisted", "rejected", "hired"].includes(status)) throw new ApiError(400, "Invalid application status.");
  if (status === "shortlisted") {
    const scheduleError = interviewScheduleError(interviewDate, interviewTime);
    if (scheduleError) throw new ApiError(400, scheduleError);
    textField(interviewLoc, "interview location", 1000);
  }
  const application = await prisma.$transaction(async tx => {
    const updated = await tx.application.update({ where: { id: applicationId }, data: {
      status, interviewDate: status === "shortlisted" ? interviewDate : null,
      interviewTime: status === "shortlisted" ? interviewTime : null, interviewLoc: status === "shortlisted" ? interviewLoc : null,
    }, include: { job: { select: { company: true, role: true } } } });
    await tx.notification.create({ data: {
      userId: updated.userId,
      title: status === "shortlisted" ? "Interview scheduled" : "Application update",
      message: status === "shortlisted" ? `${updated.job.company} scheduled your interview for ${updated.job.role} on ${interviewDate} at ${interviewTime} (Africa/Lagos). Location: ${interviewLoc}` : `Your application for ${updated.job.role} at ${updated.job.company} is now ${status}.`,
    } });
    return updated;
  });
  let emailDelivered = false;
  if (status === "shortlisted") {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: application.userId }, select: { email: true } });
    try { await sendEmail(user.email, `Interview: ${application.job.role}`, `<p>${escapeHtml(application.job.company)} scheduled your interview for ${escapeHtml(application.job.role)}.</p><p>${escapeHtml(interviewDate)} at ${escapeHtml(interviewTime)} (Africa/Lagos)<br>${escapeHtml(interviewLoc)}</p>`); emailDelivered = true; }
    catch (error) { console.error("Interview email delivery failed", error); }
  }
  return NextResponse.json({ success: true, application, emailDelivered });
}, { application: true, verifiedEmployer: true, limit: 30 });
