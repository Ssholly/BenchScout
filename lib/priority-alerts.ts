import { listingUrl } from "@/lib/listing-url";
type AlertJob = { title?: string; role?: string; company: string; desc?: string | null; url: string; tier: number };
export function priorityAlertMatches<T extends AlertJob>(jobs: T[], preferences: { alertKeywords?: string | null; alertTier?: string | null }) {
  const keywords = (preferences.alertKeywords || "").toLowerCase().split(",").map(value=>value.trim()).filter(Boolean);
  return jobs.filter(job => listingUrl(job.url) && (!keywords.length || keywords.some(keyword => `${job.title || job.role || ""} ${job.company} ${job.desc || ""}`.toLowerCase().includes(keyword))) && (preferences.alertTier !== "Tier 1 Only" || job.tier === 1) && (preferences.alertTier !== "Tier 1 & Tier 2" || job.tier <= 2));
}
