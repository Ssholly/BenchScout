import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/security";
import { collectJobs } from "@/lib/job-sources";
import { legacyPortalUrls, scoreJob, type MatchPreferences } from "@/lib/job-matching";
import { listingUrl } from "@/lib/listing-url";
import { buildJobDigest } from "@/lib/digest";
import { sendEmail } from "@/lib/mailer";
import { candidateProfile } from "@/lib/candidate-profile";
export async function runJobScan(userId: string, overrides: Partial<MatchPreferences> & { autoSend?: boolean } = {}, trigger = "Manual", appUrl = process.env.NEXT_PUBLIC_APP_URL) {
  const now = new Date();
  const claim = await prisma.user.updateMany({ where: { id: userId, OR: [{ scanLeaseUntil: null }, { scanLeaseUntil: { lt: now } }] }, data: { scanLeaseUntil: new Date(now.getTime() + 120000) } });
  if (!claim.count) throw new ApiError(409, "A scan is already running. Please wait for it to finish.");
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const profile = candidateProfile(user.candidateProfile);
    const preferences: MatchPreferences = { careerPhase: user.careerPhase, location: profile.preferredLocations || user.location, keywords: user.keywords || profile.specialties || "", minScore: user.minScore, strictMls: user.strictMls, includeTier3: true, ...overrides };
    // Career stage is always server-owned, including manual scan requests.
    preferences.careerPhase = user.careerPhase;
    if (profile.preferredLocations && !overrides.location) preferences.location = profile.preferredLocations;
    const result = await collectJobs(preferences.careerPhase, preferences.location === "All Nigeria" || preferences.location.includes(",") ? "Nigeria" : preferences.location);
    if (!result.successful) throw new ApiError(502, "Job sources are temporarily unavailable. Your existing matches have been preserved.");
    const matches = result.jobs.filter(job => !legacyPortalUrls.includes(job.url)).map(job => scoreJob(job, preferences)).filter(job => job !== null).sort((a,b) => b.score-a.score).slice(0,50);
    const existing = await prisma.job.findMany({ where: { userId }, select: { id: true, url: true, applied: true, status: true } });
    const newMatches = matches.filter(job => !existing.some(previous => previous.url === job.url));
    await prisma.$transaction(matches.map(job => {
      const previous = existing.find(previous => previous.url === job.url);
      const data = { role: job.title, company: job.company, loc: job.loc, desc: job.desc, url: job.url, score: job.score, tier: job.tier, skills: job.skills, source: job.source, lastSeenAt: now, jobType: preferences.careerPhase === "internship" ? "internship" : /\blocum\b/i.test(job.title) ? "locum" : /\bcontract\b/i.test(job.title) ? "contract" : /part[- ]time/i.test(job.title) ? "part-time" : "full-time" };
      return previous ? prisma.job.update({ where: { id: previous.id }, data: { ...data, ...(!previous.applied && previous.status !== "declined" ? { status: "active" } : {}) } }) : prisma.job.create({ data: { ...data, userId, salary: "Not disclosed", status: "active" } });
    }));
    let emailStatus = "run only";
    const alertKeywords = (user.alertKeywords || "").toLowerCase().split(",").map(value => value.trim()).filter(Boolean);
    const emailJobs = newMatches.filter(job => listingUrl(job.url) && (!alertKeywords.length || alertKeywords.some(keyword => `${job.title} ${job.company} ${job.desc}`.toLowerCase().includes(keyword))) && (user.alertTier !== "Tier 1 Only" || job.tier === 1) && (user.alertTier !== "Tier 1 & Tier 2" || job.tier <= 2));
    if ((overrides.autoSend ?? user.autoSendEmail) && emailJobs.length) {
      try {
        const digest = buildJobDigest(emailJobs, { name: user.name, isNew: true, date: now, appUrl });
        await sendEmail(user.email, `BenchScout: ${digest.count} new job matches`, digest.html, digest.text);
        emailStatus = "sent";
      } catch { emailStatus = "email failed"; result.warnings.push("Matches were saved, but the email could not be delivered."); }
    }
    await prisma.runHistory.create({ data: { userId, matches: newMatches.length, t1Count: newMatches.filter(job => job.tier === 1).length, trigger, status: emailStatus } });
    return { success: true, message: `Scan complete. ${newMatches.length} new matches; ${matches.length} listings checked.`, warnings: result.warnings };
  } catch (error) {
    await prisma.runHistory.create({ data: { userId, matches: 0, t1Count: 0, trigger, status: "failed" } }).catch(() => undefined);
    throw error;
  } finally { await prisma.user.update({ where: { id: userId }, data: { scanLeaseUntil: null } }); }
}
