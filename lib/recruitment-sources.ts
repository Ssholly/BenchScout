import * as cheerio from "cheerio";
import type { ScrapedJob } from "@/lib/types";

type Source = { name: string; url: string; company?: string; location?: string };
export const recruitmentSources: Source[] = [
  { name: "Medical World Nigeria", url: "https://medicalworldnigeria.com/jobs/internship-openings?page=1" },
  { name: "Jobberman", url: "https://www.jobberman.com/jobs?q=medical%20laboratory" },
  { name: "Jobzilla", url: "https://www.jobzilla.ng/category/laboratory-diagnostics" },
  { name: "UBTH", url: "https://ubth.org/category/recruitment/", company: "University of Benin Teaching Hospital", location: "Benin City, Edo" },
  { name: "UNTH", url: "https://unth.edu.ng/news-events/", company: "University of Nigeria Teaching Hospital", location: "Ituku-Ozalla, Enugu" },
  { name: "UCH", url: "https://employment.uch-ibadan.org.ng/", company: "University College Hospital, Ibadan", location: "Ibadan, Oyo" },
  { name: "Chevron Nigeria", url: "https://careers.chevron.com/nigeria-jobs", company: "Chevron Nigeria" },
];
const clean = (text: string) => text.replace(/[\t ]+/g, " ").replace(/\n\s*\n/g, "\n").trim();
const lab = /medical laboratory|laboratory scient|\bMLS\b|chemical pathology|histopathology|haematology|hematology|medical microbiology/i;
const advert = /intern|vacanc|recruit|advertisement|job opening/i;
function allowedUrl(raw: string, base: string) {
  try {
    const url = new URL(raw, base), origin = new URL(base);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hostname.replace(/^www\./, "") !== origin.hostname.replace(/^www\./, "")) return null;
    url.hash = "";
    return url.href;
  } catch { return null; }
}
async function readPublic(url: string, base: string, redirects = 0): Promise<{ text: string; pdf: boolean }> {
  if (!allowedUrl(url, base) || redirects > 3) throw new Error("Unsupported source redirect");
  const response = await fetch(url, { cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(7000), headers: { "User-Agent": "BenchScout/1.0" } });
  if (response.status >= 300 && response.status < 400) {
    const next = allowedUrl(response.headers.get("location") || "", url);
    if (!next) throw new Error("Unsupported source redirect");
    return readPublic(next, base, redirects + 1);
  }
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty source response");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 5_000_000) throw new Error("Source document too large"); chunks.push(value); }
  } finally { await reader.cancel(); }
  const buffer = Buffer.concat(chunks);
  const pdf = buffer.subarray(0, 5).toString() === "%PDF-";
  if (pdf) { const { pdfToText } = await import("pdf-ts"); return { text: (await pdfToText(buffer)).slice(0, 60000), pdf }; }
  return { text: buffer.toString("utf8"), pdf };
}
export function announcementLinks(html: string, source: Source) {
  const $ = cheerio.load(html); $("nav,body > header,body > footer").remove();
  const links = new Map<string, string>();
  $("a[href]").each((_, element) => {
    const label = clean($(element).text());
    const title = !label || /^(read more|\d+ comments?)$/i.test(label) ? clean($(element).closest("article").find("h2,h3").first().text()) : label;
    const url = allowedUrl($(element).attr("href") || "", source.url);
    if (!url || url === source.url || /\/category\/|\/tag\/|\/jobs\/?(?:\?|$)/i.test(url)) return;
    if ((lab.test(title) && (!source.company || advert.test(title))) || (advert.test(title) && /hospital|intern|advertisement/i.test(title))) links.set(url, title);
  });
  return [...links].slice(0, 10).map(([url, title]) => ({ url, title }));
}
export function parseAnnouncement(text: string, title: string, url: string, source: Source, deadlineFrom: (text: string) => string | undefined): ScrapedJob | null {
  // An archive or generic portal is never itself a vacancy. Require explicit role evidence.
  if (!lab.test(title) && !(advert.test(title) && lab.test(text))) return null;
  if (source.company && !advert.test(title) && !/applications? (?:are )?invited|apply (?:now|online)|job description/i.test(text)) return null;
  const deadline = deadlineFrom(text);
  const today = new Date().toISOString().slice(0, 10);
  const year = title.match(/\b(20\d{2})\b/)?.[1];
  if (deadline && deadline < today || !deadline && year && Number(year) < new Date().getUTCFullYear()) return null;
  // Old dated notices without a resolvable closing date are not current opportunities.
  const published = text.match(/(?:Published|Posted on|datePublished)\s*[:" ]+([^\n]+)/i)?.[1];
  if (!deadline && published && /\b20\d{2}\b/.test(published) && Number(published.match(/\b(20\d{2})\b/)![1]) < new Date().getUTCFullYear()) return null;
  const internship = /\bintern(?:s|ships?)?\b/i.test(title);
  const role = lab.test(title) ? title : `Medical Laboratory Science${internship ? " Intern" : ""} — ${title}`;
  return { title: role, company: source.company || title.split(/\s+at\s+/i).slice(1).join(" at ") || title, loc: clean(text.match(/\bLocations?\s*:\s*([^\n]+)/i)?.[1] || source.location || text.match(/\b(?:[A-Z][a-z]+,? )?(?:Lagos|Abuja|Enugu|Anambra|Ebonyi|Imo|Edo|Oyo|Delta|Rivers|Cross River)(?: State)?\b/)?.[0] || "Location not specified"), url, desc: text.slice(0, 10000), source: source.name, ...(internship ? { jobType: "internship" } : {}), deadline };
}
export async function collectRecruitmentSource(source: Source, deadlineFrom: (text: string) => string | undefined) {
  const page = await readPublic(source.url, source.url);
  const links = announcementLinks(page.text, source);
  const results = await Promise.allSettled(links.map(async link => {
    const detail = await readPublic(link.url, source.url);
    let text = detail.text, title = link.title;
    if (!detail.pdf) {
      const $ = cheerio.load(text);
      const structured: Record<string, unknown>[] = [];
      const entities = new Map<string, Record<string, unknown>>();
      function visit(value: unknown) {
        if (Array.isArray(value)) { value.forEach(visit); return; }
        if (!value || typeof value !== "object") return;
        const record = value as Record<string, unknown>;
        if (typeof record["@id"] === "string" && Object.keys(record).length > 1) entities.set(record["@id"],record);
        if (record["@type"] === "JobPosting") structured.push(record);
        if (record["@graph"]) visit(record["@graph"]);
      }
      $('script[type="application/ld+json"]').each((_, element) => { try { visit(JSON.parse($(element).text())); } catch { /* Ignore malformed optional metadata. */ } });
      const posting = structured[0];
      if (posting && typeof posting.title === "string" && typeof posting.description === "string") {
        const organizationRef = posting.hiringOrganization as { name?: string; "@id"?: string } | undefined;
        const organization = (organizationRef?.["@id"] ? entities.get(organizationRef["@id"]) : organizationRef) as { name?: string } | undefined;
        const place = (Array.isArray(posting.jobLocation) ? posting.jobLocation[0] : posting.jobLocation) as { address?: { addressLocality?: string; addressRegion?: string } } | undefined;
        const location = [place?.address?.addressLocality,place?.address?.addressRegion].filter(value=>typeof value === "string").join(", ");
        const expiry = typeof posting.validThrough === "string" ? posting.validThrough.slice(0,10) : "";
        const job = parseAnnouncement(`Job description\n${clean(cheerio.load(posting.description).text())}`, posting.title, link.url, {...source,company:organization?.name || source.company,location:location || source.location}, () => /^\d{4}-\d{2}-\d{2}$/.test(expiry) && Number.isFinite(Date.parse(expiry)) ? expiry : undefined);
        if (job) return {...job, ...(posting.employmentType === "INTERN" ? { jobType:"internship" } : {})};
        return null;
      }
      const published = $('meta[property="article:published_time"]').attr("content") || $("time[datetime]").first().attr("datetime") || $(".post-date").first().text();
      title = clean($('meta[property="og:title"]').attr("content") || $("h1.entry-title,h1.post-title,article h1,main h1").first().text()) || title;
      $("script,style,nav,footer,header,aside,.comments-area,.link-ads,.share-and-subscribe,.related-posts").remove();
      const body = $(".single-page-content,.entry-content,.post-content").first();
      const content = body.length ? body : $("article,main").first();
      if (!content.length) throw new Error("No readable announcement content");
      content.find("br").replaceWith("\n"); content.find("p,li,div,h2,h3").append("\n");
      text = clean(content.text());
      text += `\nPublished: ${published}`;
      const pdfs = [...new Set(content.find('a[href]').toArray().map(element => allowedUrl($(element).attr("href") || "", link.url)).filter((url): url is string => !!url && /\.pdf(?:\?|$)/i.test(url)))].slice(0, 2);
      for (const pdf of pdfs) text += `\n${(await readPublic(pdf, source.url)).text}`;
    }
    return parseAnnouncement(text, title, link.url, source, deadlineFrom);
  }));
  const jobs = results.flatMap(result => result.status === "fulfilled" && result.value ? [result.value] : []);
  const failed = results.filter(result => result.status === "rejected").length;
  return { jobs, warning: failed ? `${source.name}: ${failed} announcement(s) or attachments could not be read.` : undefined };
}
