import type { ScrapedJob } from "@/lib/types";
export const legacyPortalUrls = ["https://nationalhospital.gov.ng/careers", "https://fmcasaba.gov.ng/careers", "https://apply.deloitte.com/careers/", "https://eha.ng/careers", "https://www.lancet.com.ng/", "https://www.synlab.com.ng/"];
export type MatchPreferences = { careerPhase: string; location: string; keywords: string; minScore: number; strictMls: boolean; includeTier3: boolean };
export function scoreJob(job: ScrapedJob, preferences: MatchPreferences) {
  const title = job.title.toLowerCase();
  const text = `${job.title} ${job.desc}`.toLowerCase();
  const isLab = /laboratory|\blab\b|scientist|\bmls\b|phlebotom|blood bank|haematolog|hematolog|microbiolog/.test(title);
  if (preferences.strictMls && (!isLab || /nurse|receptionist|driver|sales|marketing/.test(title))) return null;
  const internship = job.jobType === "internship" || /\bintern(?:s|ships?)?\b|housemanship/.test(title);
  if (preferences.careerPhase === "internship" && (!internship || /senior|principal|chief/.test(title))) return null;
  if (preferences.careerPhase !== "internship" && internship) return null;
  const targets = preferences.location.toLowerCase().split(",").map(value=>value.trim().replace("fct - ", ""));
  const anywhere = targets.some(target=>!target || ["all", "all nigeria", "nigeria"].includes(target));
  const locationMatch = anywhere || targets.some(target=>job.loc.toLowerCase().includes(target) || (/abuja|fct/.test(target) && /abuja|fct/i.test(job.loc))) || /remote/i.test(job.loc);
  if (!locationMatch) return null;
  if (job.deadline && job.deadline < new Date().toISOString().slice(0,10)) return null;
  const keywords = [...new Set(preferences.keywords.toLowerCase().split(",").map(value => value.trim()).filter(Boolean))];
  const skills = keywords.filter(keyword => text.includes(keyword));
  const score = Math.min(99, 55 + (isLab ? 15 : 0) + (anywhere ? 0 : 10) + Math.min(20, skills.length * 5) + (internship ? 10 : 0));
  const tier = score >= 90 ? 1 : score >= 75 ? 2 : 3;
  if (score < preferences.minScore || (!preferences.includeTier3 && tier === 3)) return null;
  return { ...job, score, tier, skills: skills.join(", ") || "See vacancy requirements" };
}
export function scheduleDue(user: { scanTime: string; scanDays: string; scanTimezone: string; lastScheduledAt: Date | null }, now: Date) {
  const parts = (date: Date) => Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: user.scanTimezone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date).map(part => [part.type, part.value]));
  const current = parts(now);
  if (!user.scanDays.split(",").includes(current.weekday) || `${current.hour}:${current.minute}` < user.scanTime) return false;
  if (!user.lastScheduledAt) return true;
  const last = parts(user.lastScheduledAt);
  return `${last.year}-${last.month}-${last.day}` !== `${current.year}-${current.month}-${current.day}`;
}
