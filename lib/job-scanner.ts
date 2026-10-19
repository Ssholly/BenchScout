import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/security";
import { collectJobs } from "@/lib/job-sources";
import { legacyPortalUrls, scoreJob, type MatchPreferences } from "@/lib/job-matching";
import { priorityAlertMatches } from "@/lib/priority-alerts";
import { buildJobDigest } from "@/lib/digest";
import { sendEmail } from "@/lib/mailer";
import { candidateProfile, listingDetails, opportunityForPreferences } from "@/lib/candidate-profile";
export async function runJobScan(userId: string, overrides: Partial<MatchPreferences> & { autoSend?: boolean } = {}, trigger = "Manual", appUrl = process.env.NEXT_PUBLIC_APP_URL) {
  const now = new Date();
  const claim = await prisma.user.updateMany({ where: { id: userId, OR: [{ scanLeaseUntil: null }, { scanLeaseUntil: { lt: now } }] }, data: { scanLeaseUntil: new Date(now.getTime() + 120000) } });
  if (!claim.count) throw new ApiError(409, "A scan is already running. Please wait for it to finish.");
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const profile = candidateProfile(user.candidateProfile);
    const preferences: MatchPreferences = { careerPhase: user.careerPhase, location: profile.preferredLocations || user.location || "All Nigeria", keywords: user.keywords || profile.specialties || "", minScore: user.minScore, strictMls: user.strictMls, includeTier3: true, ...overrides };
    // Career stage is always server-owned, including manual scan requests.
    preferences.careerPhase = user.careerPhase;
    if (profile.preferredLocations && !overrides.location) preferences.location = profile.preferredLocations;
    const result = await collectJobs(preferences.careerPhase, /^(all nigeria|all|nigeria)$/i.test(preferences.location.trim()) || preferences.location.includes(",") ? "Nigeria" : preferences.location.replace(/^FCT\s*-\s*/i,""));
    if (!result.successful) throw new ApiError(502, "Job sources are temporarily unavailable. Your existing matches have been preserved.");
    const matches = result.jobs.map(job=>({...job,jobType:job.jobType || (/\blocum\b/i.test(job.title) ? "locum" : /\bcontract\b/i.test(job.title) ? "contract" : /part[- ]time/i.test(job.title) ? "part-time" : "full-time")}))
      .filter(job=>!legacyPortalUrls.includes(job.url) && opportunityForPreferences(job,preferences.careerPhase,{...profile,preferredLocations:preferences.location},preferences.location))
      .map(job=>scoreJob(job,preferences)).filter(job=>job !== null).sort((a,b)=>b.score-a.score).slice(0,50);
    const existing = await prisma.job.findMany({ where: { userId }, select: { id: true, url: true, applied: true, status: true, listingDetails:true } });
    const newMatches = matches.filter(job => !existing.some(previous => previous.url === job.url));
    const current = await prisma.user.findUniqueOrThrow({where:{id:userId}});
    if (current.careerPhase !== user.careerPhase) throw new ApiError(409,"Your professional stage changed during the scan. Run a new scan for your current stage.");
    await prisma.$transaction(matches.map(job => {
      const previous = existing.find(previous => previous.url === job.url);
      const data = { role: job.title, company: job.company, loc: job.loc, desc: job.desc, url: job.url, score: job.score, tier: job.tier, skills: job.skills, source: job.source, lastSeenAt: now, ...(job.deadline ? {listingDetails:{...listingDetails(previous?.listingDetails),deadline:job.deadline}} : {}), jobType: preferences.careerPhase === "internship" ? "internship" : /\blocum\b/i.test(job.title) ? "locum" : /\bcontract\b/i.test(job.title) ? "contract" : /part[- ]time/i.test(job.title) ? "part-time" : "full-time" };
      return previous ? prisma.job.update({ where: { id: previous.id }, data: { ...data, ...(!previous.applied && !["declined", "removed"].includes(previous.status || "") ? { status: "active" } : {}) } }) : prisma.job.create({ data: { ...data, userId, salary: "Not disclosed", status: "active" } });
    }));
    let emailStatus = "run only";
    const emailJobs = priorityAlertMatches(newMatches,user);
    if ((overrides.autoSend ?? user.autoSendEmail) && emailJobs.length) {
      try {
        const digest = buildJobDigest(emailJobs, { name: user.name, isNew: true, date: now, appUrl });
        await sendEmail(user.email, `BenchScout: ${digest.count} new job matches`, digest.html, digest.text);
        emailStatus = "sent";
      } catch { emailStatus = "email failed"; result.warnings.push("Matches were saved, but the email could not be delivered."); }
    }
    await prisma.runHistory.create({ data: { userId, matches: newMatches.length, t1Count: newMatches.filter(job => job.tier === 1).length, trigger, status: emailStatus } });
    const report = {location:preferences.location,careerPhase:preferences.careerPhase,scannedAt:now.toISOString(),retrieved:result.jobs.length,matched:matches.length,added:newMatches.length,warnings:result.warnings};
    await prisma.user.update({where:{id:userId,credentialRevision:current.credentialRevision ?? 0},data:{candidateProfile:{...profileFrom(current.candidateProfile),lastScan:report}}}).catch((error: unknown) => {
      if (error && typeof error === "object" && "code" in error && error.code === "P2025") throw new ApiError(409,"Your credential record changed during the scan. Matches were saved; rerun the scan for your current profile.");
      throw error;
    });
    const label = preferences.careerPhase === "internship" ? "placements" : "matches";
    return { success:true, message:`Scan complete for ${preferences.location}: ${matches.length} ${label} matched (${newMatches.length} new) from ${result.jobs.length} retrieved listings.${!matches.length ? " No listings met your professional stage, location and minimum score." : ""}${emailStatus === "email failed" ? " Matches were saved, but the email could not be delivered." : ""}`, warnings:result.warnings, report };
  } catch (error) {
    await prisma.runHistory.create({ data: { userId, matches: 0, t1Count: 0, trigger, status: "failed" } }).catch(() => undefined);
    throw error;
  } finally { await prisma.user.update({ where: { id: userId }, data: { scanLeaseUntil: null } }); }
}
function profileFrom(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string,import("@prisma/client").Prisma.InputJsonValue> : {};
}
