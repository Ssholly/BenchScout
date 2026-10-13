import * as cheerio from "cheerio";
import type { ScrapedJob } from "@/lib/types";
import { safeExternalUrl } from "@/lib/security";
const fetchPage = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(12000), headers: { "User-Agent": "BenchScout/1.0", ...init?.headers } });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response;
};
export function normalizeApifyJob(value: unknown, source: string): ScrapedJob | null {
  if (!value || typeof value !== "object") return null;
  const job = value as Record<string, unknown>;
  const string = (...keys: string[]) => keys.map(key => job[key]).find((value): value is string => typeof value === "string" && Boolean(value.trim())) || "";
  const title = string("positionName", "title", "jobTitle");
  const rawCompany = job.company;
  const company = string("companyName", "company") || (rawCompany && typeof rawCompany === "object" && "name" in rawCompany && typeof rawCompany.name === "string" ? rawCompany.name : "Employer not specified");
  const rawUrl = string("url", "jobUrl", "externalApplyLink", "linkedinJobUrl");
  if (!title || !rawUrl) return null;
  try { return { title, company, loc: string("location") || "Location not specified", url: safeExternalUrl(rawUrl), desc: string("description", "descriptionText").slice(0, 10000), source }; } catch { return null; }
}
export async function collectJobs(careerPhase: string, location: string) {
  const query = careerPhase === "internship" ? "medical laboratory internship" : "medical laboratory scientist";
  const searches: { source: string; run: () => Promise<ScrapedJob[]> }[] = [
    { source: "MyJobMag", run: async () => {
      const response = await fetchPage(`https://www.myjobmag.com/search/jobs?job_q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
      const $ = cheerio.load(await response.text()); const jobs: ScrapedJob[] = [];
      $(".job-info").each((_index, element) => {
        const title = $(element).find("h2 a").text().trim(); const href = $(element).find("h2 a").attr("href");
        if (!title || !href) return;
        try { jobs.push({ title, company: $(element).find(".job-desc li:first-child").text().trim() || "Employer not specified", loc: $(element).find(".location").text().replace("Location:", "").trim() || "Location not specified", url: safeExternalUrl(new URL(href, "https://www.myjobmag.com").href), desc: $(element).find(".job-desc").text().slice(0,10000), source: "MyJobMag" }); } catch { /* Skip invalid links. */ }
      });
      return jobs;
    } },
    { source: "HotNigerianJobs", run: async () => {
      const response = await fetchPage("https://www.hotnigerianjobs.com/discipline/686/");
      const $ = cheerio.load(await response.text()); const jobs: ScrapedJob[] = [];
      $(".job-item, .job-desc").each((_index, element) => {
        const link = $(element).find("h2 a, h3 a, h1 a").first(); const title = link.text().trim(); const href = link.attr("href");
        if (!title || !href) return;
        try { jobs.push({ title, company: "See posting for employer", loc: "Location not specified", url: safeExternalUrl(new URL(href, "https://www.hotnigerianjobs.com").href), desc: $(element).text().slice(0,10000), source: "HotNigerianJobs" }); } catch { /* Skip invalid links. */ }
      }); return jobs;
    } },
  ];
  if (process.env.APIFY_API_KEY) {
    for (const [source, actor, input] of [
      ["Indeed", "misceres~indeed-scraper", { position: query, country: "NG", location, maxItems: 30 }],
      ["LinkedIn", "hKByXkMQaC5Qt9UMN", { urls: [`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`], count: 30 }],
    ] as const) searches.push({ source, run: async () => {
      const response = await fetchPage(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?timeout=10`, { method: "POST", headers: { Authorization: `Bearer ${process.env.APIFY_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data: unknown = await response.json(); if (!Array.isArray(data)) throw new Error("Invalid source response");
      return data.map(job => normalizeApifyJob(job, source)).filter((job): job is ScrapedJob => job !== null);
    } });
  }
  const results = await Promise.allSettled(searches.map(search => search.run()));
  const jobs = new Map<string, ScrapedJob>(); const warnings: string[] = []; let successful = 0;
  results.forEach((result, index) => {
    if (result.status === "rejected") warnings.push(`${searches[index].source} could not be reached.`);
    else { successful++; if (!result.value.length) warnings.push(`${searches[index].source} returned no usable listings.`); result.value.forEach(job => jobs.set(job.url, job)); }
  });
  return { jobs: [...jobs.values()], warnings, successful };
}
