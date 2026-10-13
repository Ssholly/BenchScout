import * as cheerio from "cheerio";
import type { ScrapedJob } from "@/lib/types";
import { safeExternalUrl } from "@/lib/security";
import { opportunityForPhase } from "@/lib/candidate-profile";

const fetchPage = async (url: string, init?: RequestInit, timeout = 12000) => {
  const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(timeout), headers: { "User-Agent": "BenchScout/1.0", ...init?.headers } });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response;
};
const clean = (value: string) => value.replace(/\u00a0/g," ").replace(/[\t ]+/g," ").trim();
const companyFromTitle = (title: string) => title.split(/\s+at\s+/i).slice(1).join(" at ").trim() || "Employer not specified";
export function postingDeadline(text: string) {
  const match = text.match(/(?:Application Closing Date|Closing Date|Deadline)\s*:?\s*(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s*,?\s*(20\d{2})/i);
  if (!match) return undefined;
  const month = ["january","february","march","april","may","june","july","august","september","october","november","december"].findIndex(value=>value.startsWith(match[2].toLowerCase()));
  if (month < 0) return undefined;
  const date = `${match[3]}-${String(month+1).padStart(2,"0")}-${match[1].padStart(2,"0")}`;
  return Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0,10) === date ? date : undefined;
}
const locationFromText = (text: string) => clean(text.match(/\bLocations?\s*:\s*([^\n]+)/i)?.[1] || text.match(/(?:position|role) is located in ([^.\n]+)/i)?.[1] || "") || "Location not specified";
export function parseMyJobMag(html: string): ScrapedJob[] {
  const $ = cheerio.load(html); const jobs: ScrapedJob[] = [];
  $(".job-info").each((_index, element) => {
    const title = clean($(element).find("h2 a").text()); const href = $(element).find("h2 a").attr("href");
    if (!title || !href) return;
    try { jobs.push({ title, company: companyFromTitle(title), loc: clean($(element).find(".location").text().replace("Location:","")) || "Location not specified", url: safeExternalUrl(new URL(href,"https://www.myjobmag.com").href), desc: clean($(element).find(".job-desc").text()).slice(0,10000), source:"MyJobMag" }); } catch { /* Invalid source link. */ }
  });
  return jobs;
}
export function parseHotJobs(html: string): ScrapedJob[] {
  const $ = cheerio.load(html); const jobs: ScrapedJob[] = [];
  $(".jobheader").each((_index, element) => {
    const link = $(element).find("h1 a,h2 a,h3 a").first(); const title = clean(link.text()); const href = link.attr("href");
    if (!title || !href) return;
    const desc = clean($(element).parent().find(".mycase4").text());
    try { jobs.push({ title, company:companyFromTitle(title), loc:locationFromText(desc), url:safeExternalUrl(new URL(href,"https://www.hotnigerianjobs.com").href), desc:desc.slice(0,10000), source:"HotNigerianJobs" }); } catch { /* Invalid source link. */ }
  });
  return jobs;
}
export function enrichPosting(job: ScrapedJob, html: string): ScrapedJob {
  const $ = cheerio.load(html); $("script,style,nav,footer").remove();
  const keyInfo = clean($(".job-key-info").text());
  const text = job.source === "HotNigerianJobs" ? clean($(".jobheader").first().parent().text()) : clean($("body").text());
  const loc = job.source === "MyJobMag" ? clean(keyInfo.match(/\bLocation\s+([^\n]+)/i)?.[1] || "") : locationFromText(text);
  const explicitInternship = /(?:Job [Tt]ype|Employment [Tt]ype)\s*:?\s*Internship\b/.test(`${keyInfo}\n${text}`);
  return {...job, loc:loc && loc !== "Location not specified" ? loc : job.loc, desc:job.source === "HotNigerianJobs" ? text.slice(0,10000) : `${job.desc}\n${keyInfo}`.slice(0,10000), ...(explicitInternship ? {jobType:"internship"} : {}), deadline:postingDeadline(text)};
}
export function normalizeApifyJob(value: unknown, source: string): ScrapedJob | null {
  if (!value || typeof value !== "object") return null;
  const job = value as Record<string, unknown>;
  const string = (...keys: string[]) => keys.map(key=>job[key]).find((value):value is string=>typeof value === "string" && Boolean(value.trim())) || "";
  const title = string("positionName","title","jobTitle"); const rawCompany = job.company;
  const company = string("companyName","company") || (rawCompany && typeof rawCompany === "object" && "name" in rawCompany && typeof rawCompany.name === "string" ? rawCompany.name : "Employer not specified");
  const rawUrl = string("url","jobUrl","externalApplyLink","linkedinJobUrl");
  const rawLocation = job.location;
  const location = string("location","jobLocation") || (rawLocation && typeof rawLocation === "object" ? Object.entries(rawLocation).filter(([key,val])=>["city","state","country"].includes(key) && typeof val === "string").map(([,val])=>val).join(", ") : "");
  if (!title || !rawUrl) return null;
  try { return {title,company,loc:location || "Location not specified",url:safeExternalUrl(rawUrl),desc:string("description","descriptionText").slice(0,10000),source}; } catch { return null; }
}
async function detailsFor(jobs: ScrapedJob[], phase: string) {
  const candidates = jobs.filter(job=>opportunityForPhase({...job,jobType:job.jobType || "full-time"},phase)).slice(0,18);
  const enriched: ScrapedJob[] = [];
  for (let offset=0;offset<candidates.length;offset+=6) {
    const batch = await Promise.all(candidates.slice(offset,offset+6).map(async job=> {
      const url = new URL(job.url);
      if (!["www.myjobmag.com","www.hotnigerianjobs.com"].includes(url.hostname) || url.protocol !== "https:") return job;
      try { return enrichPosting(job,await (await fetchPage(job.url,undefined,7000)).text()); } catch { return job; }
    }));
    enriched.push(...batch);
  }
  return enriched;
}
export async function collectJobs(careerPhase: string, location: string) {
  const query = careerPhase === "internship" ? "medical laboratory intern" : "medical laboratory scientist";
  const searches: {source:string;run:()=>Promise<ScrapedJob[]>}[] = [
    {source:"MyJobMag",run:async()=> {
      // Use the site's q parameter; the former job_q parameter was ignored.
      const pages = await Promise.all([1,2].map(async page=> {
        const url = new URL("https://www.myjobmag.com/search/jobs"); url.searchParams.set("q","medical laboratory"); if (page>1) url.searchParams.set("currentpage",String(page));
        return parseMyJobMag(await (await fetchPage(url.href)).text());
      }));
      return detailsFor(pages.flat(),careerPhase);
    }},
    {source:"HotNigerianJobs",run:async()=> {
      const pages = await Promise.all(["https://www.hotnigerianjobs.com/discipline/686/","https://www.hotnigerianjobs.com/discipline/686/1/"].map(async url=>parseHotJobs(await (await fetchPage(url)).text())));
      return detailsFor(pages.flat(),careerPhase);
    }},
  ];
  if (process.env.APIFY_API_KEY) {
    for (const [source,actor,input] of [
      ["Indeed","misceres~indeed-scraper",{position:query,country:"NG",...(location === "Nigeria" ? {} : {location}),maxItemsPerSearch:30,saveOnlyUniqueItems:true}],
      ["LinkedIn","hKByXkMQaC5Qt9UMN",{urls:[`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`],limitPerSource:30}],
    ] as const) searches.push({source,run:async()=> {
      const response = await fetchPage(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?timeout=10`,{method:"POST",headers:{Authorization:`Bearer ${process.env.APIFY_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify(input)});
      const data:unknown = await response.json(); if (!Array.isArray(data)) throw new Error("Invalid source response");
      return data.map(job=>normalizeApifyJob(job,source)).filter((job):job is ScrapedJob=>job !== null);
    }});
  }
  const results = await Promise.allSettled(searches.map(search=>search.run()));
  const jobs = new Map<string,ScrapedJob>(); const warnings:string[] = []; let successful=0;
  results.forEach((result,index)=> {
    if (result.status === "rejected") warnings.push(`${searches[index].source} could not be reached.`);
    else { successful++; if (!result.value.length) warnings.push(`${searches[index].source} returned no usable listings.`); result.value.forEach(job=>jobs.set(job.url,job)); }
  });
  return {jobs:[...jobs.values()],warnings,successful};
}
