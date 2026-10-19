import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ApiError, emailField, textField } from "@/lib/security";
import { candidateProfile, listingDetails, opportunityType } from "@/lib/candidate-profile";
import { companyChecks, vacancyChecks, reviewEvidence } from "@/lib/employer-safety";

export const GET = withApi("admin", async request => {
  const email = new URL(request.url).searchParams.get("account");
  const [employers, vacancies, reports, history] = await Promise.all([
    prisma.employer.findMany({ where: email ? { email: emailField(email) } : { verificationStatus: "pending" }, select: { id: true, email: true, companyName: true, verificationStatus: true, verificationRevision: true, verificationDetails: true, verificationFeedback: true }, take: 50, orderBy: { createdAt: "asc" } }),
    prisma.job.findMany({ where: { isDirectPost: true, status: "pending-review" }, select: { id: true, role: true, company: true, loc: true, skills: true, salary: true, updatedAt: true, employerId: true, listingDetails: true }, take: 50, orderBy: { updatedAt: "asc" } }),
    prisma.jobReport.findMany({ where: { status: "open" }, take: 50, orderBy: { createdAt: "asc" } }),
    prisma.safetyReview.findMany({ take: 25, orderBy: { createdAt: "desc" } }),
  ]);
  const reportJobs = await prisma.job.findMany({ where: { id: { in: reports.map(report => report.jobId) } }, select: { id: true, role: true, company: true, employerId: true, employer: { select: { email: true } } } });
  return NextResponse.json({ employers, vacancies, reports: reports.map(report => ({ id: report.id, jobId: report.jobId, reason: report.reason, details: report.details, createdAt: report.createdAt, job: reportJobs.find(job => job.id === report.jobId) ?? null })), history });
});

export const POST = withApi("admin", async request => {
  const body = await request.json();
  const email = ["internship", "vacancy", "report"].includes(body.kind) ? "" : emailField(body.email);
  const reference = textField(body.reference, "review evidence or reference", 2000);
  if (reference.length < 10 || typeof body.approved !== "boolean") throw new ApiError(400, "Record the review evidence and an explicit decision.");
  if (body.kind === "internship") {
    const jobId = textField(body.jobId, "vacancy ID");
    const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
    if (opportunityType(job) !== "internship") throw new ApiError(400, "Choose an internship placement.");
    if (body.approved && !/^https:\/\/(?:[\w-]+\.)*mlscn\.gov\.ng\//.test(reference)) throw new ApiError(400, "Record the official MLSCN source for this institution’s internship programme.");
    await prisma.job.update({ where: { id: jobId }, data: { isMlscnApproved: body.approved, listingDetails: { ...listingDetails(job.listingDetails), approvalSource: body.approved ? reference : "", approvalReviewedAt: body.approved ? new Date().toISOString() : "" } } });
  } else if (body.kind === "employer") {
    const decision = body.decision;
    if (!["approved", "rejected", "suspended"].includes(decision) || body.approved !== (decision === "approved")) throw new ApiError(400, "Choose an explicit employer decision.");
    const reviewer = textField(body.reviewer, "reviewer name");
    const feedback = textField(body.feedback, "employer feedback", 1000);
    const checks = body.approved ? reviewEvidence(body, companyChecks) : {};
    if (!Number.isInteger(body.revision)) throw new ApiError(400, "Load the latest employer submission first.");
    await prisma.$transaction(async tx => {
      const employer = await tx.employer.findUniqueOrThrow({ where: { email } });
      if (body.approved && (employer.verificationStatus !== "pending" || (employer.emailVerificationRequired && !employer.emailVerifiedAt))) throw new ApiError(400, "Approval requires a submitted company profile and confirmed employer email.");
      const result = await tx.employer.updateMany({ where: { id: employer.id, verificationRevision: body.revision }, data: {
        isVerified: body.approved, verifiedAt: body.approved ? new Date() : null, verificationReference: reference,
        verificationStatus: decision, verificationFeedback: feedback, verificationRevision: { increment: 1 },
      } });
      if (!result.count) throw new ApiError(409, "Submission changed. Reload before reviewing.");
      if (!body.approved) await tx.job.updateMany({ where: { employerId: employer.id, isDirectPost: true, status: "active" }, data: { status: "pending-review" } });
      await tx.safetyReview.create({ data: { kind: "employer", subjectId: employer.id, decision, reviewer, evidence: { reference, checks, feedback, submission: employer.verificationDetails, revision: body.revision } } });
    });
  } else if (body.kind === "vacancy") {
    const reviewer = textField(body.reviewer, "reviewer name");
    const checks = body.approved ? reviewEvidence(body, vacancyChecks) : {};
    const jobId = textField(body.jobId, "vacancy ID");
    if (typeof body.jobUpdatedAt !== "string" || !Number.isFinite(Date.parse(body.jobUpdatedAt))) throw new ApiError(400, "Load the latest vacancy first.");
    await prisma.$transaction(async tx => {
      const job = await tx.job.findUniqueOrThrow({ where: { id: jobId } });
      if (!job.isDirectPost || !job.employerId) throw new ApiError(400, "Choose an employer vacancy.");
      if (body.approved) {
        const employer = await tx.employer.updateMany({ where: { id: job.employerId, isVerified: true }, data: { isVerified: true } });
        if (!employer.count) throw new ApiError(400, "Review and approve the employer first.");
      }
      const result = await tx.job.updateMany({ where: { id: jobId, updatedAt: new Date(body.jobUpdatedAt) }, data: { status: body.approved ? "active" : "rejected" } });
      if (!result.count) throw new ApiError(409, "Vacancy changed. Reload before reviewing.");
      await tx.safetyReview.create({ data: { kind: "vacancy", subjectId: jobId, decision: body.approved ? "approved" : "rejected", reviewer, evidence: { reference, checks, vacancy: { role: job.role, company: job.company, loc: job.loc, skills: job.skills, salary: job.salary, listingDetails: job.listingDetails } } } });
    });
  } else if (body.kind === "report") {
    const reviewer = textField(body.reviewer, "reviewer name");
    const reportId = textField(body.reportId, "report ID");
    if (!["dismissed", "removed"].includes(body.decision)) throw new ApiError(400, "Choose a report resolution.");
    await prisma.$transaction(async tx => {
      const report = await tx.jobReport.findUniqueOrThrow({ where: { id: reportId } });
      const result = await tx.jobReport.updateMany({ where: { id: reportId, status: "open" }, data: { status: body.decision, resolution: reference, resolvedAt: new Date() } });
      if (!result.count) throw new ApiError(409, "This report has already been resolved.");
      if (body.decision === "removed") await tx.job.updateMany({ where: { id: report.jobId }, data: { status: "removed" } });
      await tx.safetyReview.create({ data: { kind: "report", subjectId: reportId, decision: body.decision, reviewer, evidence: { reference, jobId: report.jobId } } });
    });
  } else if (body.kind === "candidate") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(404, "Candidate not found.");
    const profile = candidateProfile(user.candidateProfile);
    const complete = user.careerPhase === "internship" ? user.provisionalUrl && profile.provisionalNumber && (!profile.provisionalExpiry || new Date(profile.provisionalExpiry) >= new Date()) : user.licenseNumber && user.licenseUrl && user.licenseExpiry && user.licenseExpiry > new Date();
    if (body.approved && !complete) throw new ApiError(400, "Record the candidate’s relevant license document and valid registration details before approval.");
    await prisma.user.update({ where: { id: user.id }, data: { isLicenseVerified: body.approved, licenseReviewedAt: body.approved ? new Date() : null, licenseReviewReference: reference } });
  } else throw new ApiError(400, "Choose a supported review type.");
  return NextResponse.json({ success: true });
}, { limit: 20 });
