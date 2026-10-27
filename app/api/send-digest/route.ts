import { priorityAlertMatches } from "@/lib/priority-alerts";
import { ApiError, escapeHtml, applicationOrigin } from "@/lib/security";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { opportunityForPhase, opportunityForPreferences } from "@/lib/candidate-profile";
import { listingUrl } from "@/lib/listing-url";
import { buildJobDigest } from "@/lib/digest";
import { sendEmail } from "@/lib/mailer";
import { legacyPortalUrls } from "@/lib/job-matching";

export const POST = withApi("candidate", async (request, session) => {
  const { triggerType } = await request.json();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
  if (triggerType === "COMPLIANCE_ALERT") {
    if (!user.licenseExpiry || user.licenseExpiry > new Date()) throw new ApiError(400, "Your recorded license has not expired.");
    await sendEmail(user.email, "BenchScout: review your license details", `<p>Hello ${escapeHtml(user.name)},</p><p>The license expiry date recorded in your profile has passed. Please review your details and renewal requirements with the issuing authority.</p>`);
    return Response.json({ success: true, message: "License reminder sent." });
  }
  const jobs = await prisma.job.findMany({ where: { userId: user.id, status: "active", isDirectPost: false, url: { notIn: legacyPortalUrls } }, orderBy: { score: "desc" }, take: 50 });
  let topJobs = jobs.filter(job => listingUrl(job.url) && opportunityForPhase(job, user.careerPhase) && opportunityForPreferences(job, user.careerPhase, user.candidateProfile, user.location));
  if (triggerType === "PRIORITY_TEST") {
    topJobs = priorityAlertMatches(topJobs,user);
    if (!topJobs.length) {
      await sendEmail(user.email,"BenchScout: priority alert delivery test",`<p>Hello ${escapeHtml(user.name)},</p><p>This is your requested email delivery test. None of your currently saved active listings met your saved priority filters.</p><p>Future alerts require an active scan schedule, email alerts enabled, and new listings meeting your saved filters.</p>`,"Your requested BenchScout email delivery test. No saved listings met your priority filters.");
      return Response.json({success:true,message:"Delivery test accepted by the email provider. No saved listings met your priority filters."});
    }
  }
  if (!topJobs.length) throw new ApiError(400, "No active matches to send. Run a scan first.");
  const digest = buildJobDigest(topJobs.slice(0,15), { name: user.name, appUrl: applicationOrigin(request) });
  if (!digest.count) throw new ApiError(400, "No valid listing links are available to send. Run a scan first.");
  await sendEmail(user.email, triggerType === "PRIORITY_TEST" ? "BenchScout: priority alert delivery test" : `BenchScout: ${digest.count} job matches`, digest.html, digest.text);
  return Response.json({ success: true, message: triggerType === "PRIORITY_TEST" ? "Priority email test accepted by the provider. Check your inbox and spam folder." : "Email digest sent." });
}, { limit: 2 });
