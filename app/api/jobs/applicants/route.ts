import { sendEmail } from "@/lib/mailer";
import { escapeHtml } from "@/lib/security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api";
import { ApiError, textField } from "@/lib/security";
import { candidateProfile } from "@/lib/candidate-profile";
export const GET = withApi("employer", async request => {
  const jobId = new URL(request.url).searchParams.get("jobId")!;
  const applications = await prisma.application.findMany({ where: { jobId }, include: { user: { select: {
    id: true, name: true, email: true, careerPhase: true, candidateProfile: true, licenseUrl: true, provisionalUrl: true, degreeUrl: true, statementOfResultUrl: true, resumeUrl: true, isLicenseVerified: true, licenseReviewedAt: true,
  } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, applications: applications.map(application=>{const {candidateProfile:profile,...user}=application.user;return {...application,user:{...user,placementStage:user.careerPhase === "internship" ? candidateProfile(profile).placementStage : undefined}};}) });
}, { job: "employer", verifiedEmployer: true });
export const DELETE = withApi("employer", async request => {
  const { jobId } = await request.json();
  await prisma.application.deleteMany({ where: { jobId } });
  return NextResponse.json({ success: true });
}, { job: "employer", verifiedEmployer: true });
export const PATCH = withApi("employer", async request => {
  const { applicationId, status, interviewDate, interviewTime, interviewLoc } = await request.json();
  if (!["pending", "shortlisted", "rejected", "hired"].includes(status)) throw new ApiError(400, "Invalid application status.");
  if (status === "shortlisted") {
    if (typeof interviewDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(interviewDate) || !Number.isFinite(Date.parse(interviewDate)) || new Date(interviewDate).toISOString().slice(0,10) !== interviewDate) throw new ApiError(400, "Choose a valid interview date.");
    if (typeof interviewTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(interviewTime)) throw new ApiError(400, "Choose a valid interview time.");
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
