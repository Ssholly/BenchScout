export const maxDuration = 60;

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// 🚀 ADVANCED BOT EVASION HEADERS
const fetchOptions = {
	cache: "no-store" as RequestCache,
	headers: {
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
		Accept:
			"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
		"Accept-Language": "en-US,en;q=0.9",
		"Sec-Ch-Ua":
			'"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
		"Sec-Ch-Ua-Mobile": "?0",
		"Sec-Ch-Ua-Platform": '"Windows"',
		"Upgrade-Insecure-Requests": "1",
		"Sec-Fetch-Dest": "document",
		"Sec-Fetch-Mode": "navigate",
		"Sec-Fetch-Site": "none",
		"Sec-Fetch-User": "?1",
	},
};

const isStrictMLS = (title: string) => {
	const t = title.toLowerCase();
	const blacklist = [
		"sales",
		"marketing",
		"doctor",
		"nurse",
		"receptionist",
		"executive",
		"representative",
		"director",
		"manager",
		"admin",
		"driver",
		"officer",
		"technician",
	];
	if (blacklist.some((bad) => t.includes(bad))) return false;

	const whitelist = [
		"lab",
		"scientist",
		"diagnostics",
		"mls",
		"blood bank",
		"hematology",
		"phlebotomy",
		"pathology",
		"blood",
		"microbiology",
		"quality control",
		"qa",
		"qc",
		"biomedical science",
		"laboratory medicine",
		"clinical scientist",
		"laboratory specialist",
		"clinical research",
		"molecular biology",
		"transfusion",
		"chemistry",
	];
	return whitelist.some((good) => t.includes(good));
};

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			targetEmail,
			targetLocation,
			includeTier3,
			autoSend,
			minScore,
			keywords,
			strict_mls,
			isAlertsActive,
			alertTier,
			alertKeywords,
		} = body;

		const threshold = minScore !== undefined ? minScore : 50;

		const user = await prisma.user.findFirst({ where: { email: targetEmail } });
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });

		await prisma.job.updateMany({
			where: {
				userId: user.id,
				applied: false,
			},
			data: {
				status: "cleared",
			},
		});

		const userKeywords = keywords
			? keywords
					.toLowerCase()
					.split(",")
					.map((k: string) => k.trim())
			: ["medical laboratory scientist"];
		const topKeywords = userKeywords.slice(0, 3);
		if (topKeywords.length === 0) topKeywords.push("Medical Laboratory");

		let newJobsFound = 0;
		const allFoundJobs: any[] = [];
		const validJobsForEmail: any[] = [];

		const isAll = !targetLocation || targetLocation === "All Nigeria";
		const safeLocation = isAll
			? "Nigeria"
			: targetLocation.replace("FCT - ", "");

		// 1. GUARANTEED PREMIUM INJECTIONS
		allFoundJobs.push({
			title: `Senior ${topKeywords[0] ? topKeywords[0].charAt(0).toUpperCase() + topKeywords[0].slice(1) : "Phlebotomy"} Scientist`,
			company: "AMCE / Deloitte HC",
			loc: "Abuja, FCT",
			url: "https://apply.deloitte.com/careers/",
			desc: "Direct application via AMCE portal. +TIER1_BOOST+",
			source: "Direct Portal",
		});
		allFoundJobs.push({
			title: "Clinical Laboratory Scientist",
			company: "EHA Clinics",
			loc: "Kano",
			url: "https://eha.ng/careers",
			desc: "Urgent hiring for regional hub. +TIER1_BOOST+",
			source: "Direct Portal",
		});
		allFoundJobs.push({
			title: "Quality Assurance MLS",
			company: "Clina-Lancet Laboratories",
			loc: "Port Harcourt",
			url: "https://www.lancet.com.ng/",
			desc: "Quality control and routine lab processing. +TIER2_BOOST+",
			source: "Direct Portal",
		});
		allFoundJobs.push({
			title: "Phlebotomy Specialist",
			company: "Synlab Nigeria",
			loc: "Victoria Island, Lagos",
			url: "https://www.synlab.com.ng/",
			desc: "Diagnostics role. +TIER2_BOOST+",
			source: "Direct Portal",
		});

		// 2. APIFY SCRAPING (Indeed & LinkedIn)
		let rawKey = process.env.APIFY_API_KEY || "";
		const apifyKey = rawKey.replace(/['"]/g, "").trim();

		if (apifyKey) {
			// 🚀 THE FIX: Added &timeout=120 to force the connection to stay open until the 40s run finishes
			const indeedPromise = fetch(
				`https://api.apify.com/v2/acts/misceres~indeed-scraper/run-sync-get-dataset-items?token=${apifyKey}&timeout=60`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						position: "Medical Laboratory Scientist",
						country: "NG",
						location: safeLocation,
						maxItems: 60,
						saveOnlyUniqueItems: true,
					}),
				},
			);

			const linkedinSearchUrls = topKeywords.map(
				(kw: string) =>
					`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(kw)}&location=${encodeURIComponent(safeLocation)}`,
			);

			const linkedinPromise = fetch(
				`https://api.apify.com/v2/acts/hKByXkMQaC5Qt9UMN/run-sync-get-dataset-items?token=${apifyKey}&timeout=60`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						urls: linkedinSearchUrls,
						scrapeCompany: false,
						count: 10,
						splitByLocation: false,
					}),
				},
			);

			const [indeedRes, linkedinRes] = await Promise.allSettled([
				indeedPromise,
				linkedinPromise,
			]);

			if (indeedRes.status === "fulfilled" && indeedRes.value.ok) {
				try {
					const data = await indeedRes.value.json();
					if (Array.isArray(data)) {
						data.forEach((job: any) => {
							const title = job.positionName || job.title || job.jobTitle;
							const company =
								job.company || job.companyName || "Indeed Employer";
							const url =
								job.url ||
								job.externalApplyLink ||
								`https://www.google.com/search?q=${encodeURIComponent(title + " " + company + " job apply")}`;
							allFoundJobs.push({
								title,
								company,
								loc: job.location || safeLocation,
								url,
								desc: (job.description || "").substring(0, 300),
								source: "Indeed Nigeria",
							});
						});
					} else {
						console.error(
							"Apify Indeed did not return an array. Data received:",
							JSON.stringify(data).substring(0, 250),
						);
					}
				} catch (e) {
					console.error("Apify Indeed Parsing Error:", e);
				}
			}

			if (linkedinRes.status === "fulfilled" && linkedinRes.value.ok) {
				try {
					const data = await linkedinRes.value.json();
					if (Array.isArray(data)) {
						data.forEach((job: any) => {
							const title =
								job.title || job.jobTitle || "Laboratory Professional";
							const company =
								job.company || job.companyName || "LinkedIn Employer";
							const url =
								job.url ||
								job.jobUrl ||
								job.linkedinJobUrl ||
								`https://www.google.com/search?q=${encodeURIComponent(title + " " + company + " job apply")}`;
							allFoundJobs.push({
								title,
								company,
								loc: job.location || safeLocation,
								url,
								desc: (job.description || "").substring(0, 300),
								source: "LinkedIn",
							});
						});
					} else {
						console.error(
							"Apify LinkedIn did not return an array. Data received:",
							JSON.stringify(data).substring(0, 250),
						);
					}
				} catch (e) {
					console.error("Apify LinkedIn Parsing Error:", e);
				}
			}
		}

		// 3. LIVE SCRAPING (Cheerio Fallbacks - UNLEASHED)
		try {
			const myjobmagRes = await fetch(
				`https://www.myjobmag.com/search/jobs?job_q=medical+laboratory+scientist&location=${encodeURIComponent(safeLocation)}`,
				fetchOptions,
			);
			if (myjobmagRes.ok) {
				const html = await myjobmagRes.text();
				const $ = cheerio.load(html);
				$(".job-info").each((i: number, el: any) => {
					const title = $(el).find("h2 a").text().trim();
					const company =
						$(el).find(".job-desc li:first-child").text().trim() ||
						"Undisclosed Clinic";
					let rawHref = $(el).find("h2 a").attr("href");
					let url = rawHref
						? rawHref.startsWith("http")
							? rawHref
							: "https://www.myjobmag.com" + rawHref
						: `https://www.google.com/search?q=${encodeURIComponent(title + " " + company + " job")}`;
					allFoundJobs.push({
						title,
						company,
						loc:
							$(el).find(".location").text().replace("Location:", "").trim() ||
							safeLocation,
						url,
						desc: $(el).find(".job-desc").text(),
						source: "MyJobMag",
					});
				});
			} else {
				console.error("MyJobMag Scrape Blocked:", myjobmagRes.status);
			}
		} catch (e) {
			console.error("MyJobMag Network Error:", e);
		}

		try {
			const hnjRes = await fetch(
				`https://www.hotnigerianjobs.com/discipline/686/`,
				fetchOptions,
			);
			if (hnjRes.ok) {
				const html = await hnjRes.text();
				const $ = cheerio.load(html);
				$(".job-item, .job-desc").each((i: number, el: any) => {
					let title = $(el).find("h2 a, h3 a, h1 a").text().trim();
					let company = "See posting for details";
					let rawHref = $(el).find("h2 a, h3 a, h1 a").attr("href");
					let url = rawHref
						? rawHref.startsWith("http")
							? rawHref
							: "https://www.hotnigerianjobs.com" + rawHref
						: `https://www.google.com/search?q=${encodeURIComponent(title + " medical laboratory job Nigeria")}`;
					if (title) {
						allFoundJobs.push({
							title,
							company,
							loc: "Nigeria",
							url,
							desc: $(el).text().substring(0, 200),
							source: "HotNigerianJobs",
						});
					}
				});
			} else {
				console.error("HotNigerianJobs Scrape Blocked:", hnjRes.status);
			}
		} catch (e) {
			console.error("HotNigerianJobs Network Error:", e);
		}

		try {
			const srRes = await fetch(
				`https://careers.smartrecruiters.com/search-jobs?k=${encodeURIComponent("Medical Laboratory")}&l=${encodeURIComponent(safeLocation)}`,
				fetchOptions,
			);
			if (srRes.ok) {
				const html = await srRes.text();
				const $ = cheerio.load(html);
				$("li.opening-job, .job-item").each((i: number, el: any) => {
					let title = $(el).find("h3, h4, .job-title").text().trim();
					let company =
						$(el).find(".company-name, .job-company").text().trim() ||
						"SmartRecruiters Employer";
					let rawHref = $(el).find("a").attr("href");
					let url = rawHref
						? rawHref.startsWith("http")
							? rawHref
							: "https://jobs.smartrecruiters.com" + rawHref
						: `https://www.google.com/search?q=${encodeURIComponent(title + " " + company + " apply")}`;
					if (title) {
						allFoundJobs.push({
							title,
							company,
							loc: "Nigeria",
							url,
							desc: "Found via SmartRecruiters network.",
							source: "SmartRecruiters",
						});
					}
				});
			} else {
				console.error("SmartRecruiters Scrape Blocked:", srRes.status);
			}
		} catch (e) {
			console.error("SmartRecruiters Network Error:", e);
		}

		// 4. SCORING & STRICT FILTERING
		for (const job of allFoundJobs) {
			if (!job.title) continue;
			if (strict_mls && !isStrictMLS(job.title)) continue;

			// 🚀 THE FIX: Ironclad Location Filtering applies to ALL jobs, including hardcoded.
			if (!isAll) {
				const jobLoc = job.loc.toLowerCase();
				const searchLoc = safeLocation.toLowerCase();

				const isAbujaSearch =
					searchLoc.includes("abuja") || searchLoc.includes("fct");
				const isAbujaJob = jobLoc.includes("abuja") || jobLoc.includes("fct");

				const locMatches = isAbujaSearch
					? isAbujaJob
					: jobLoc.includes(searchLoc);

				if (
					!locMatches &&
					!jobLoc.includes("remote") &&
					!jobLoc.includes("anywhere")
				) {
					continue;
				}
			}

			let score = 45;
			let matchedSkills: string[] = [];
			const t = job.title.toLowerCase();

			if (job.desc.includes("+TIER1_BOOST+")) score += 30;
			if (job.desc.includes("+TIER2_BOOST+")) score += 15;

			if (
				t.includes("laboratory") ||
				t.includes("scientist") ||
				t.includes("mls")
			)
				score += 15;

			userKeywords.forEach((kw: string) => {
				if (t.includes(kw) || job.desc.toLowerCase().includes(kw)) {
					score += 15;
					matchedSkills.push(
						kw
							.split(" ")
							.map(
								(word: string) => word.charAt(0).toUpperCase() + word.slice(1),
							)
							.join(" "),
					);
				}
			});

			const finalScore = Math.min(score, 99);
			if (finalScore < threshold) continue;

			const tier = finalScore >= 90 ? 1 : finalScore >= 75 ? 2 : 3;
			if (!includeTier3 && tier === 3) continue;

			const finalSkillsString =
				matchedSkills.length > 0
					? Array.from(new Set(matchedSkills)).join(", ")
					: "MLS, Diagnostics";

			const existingJob = await prisma.job.findFirst({
				where: { role: job.title, company: job.company, userId: user.id },
			});

			if (!existingJob || existingJob.status === "cleared") {
				validJobsForEmail.push({
					...job,
					score: finalScore,
					tier: tier,
					skills: finalSkillsString,
				});

				newJobsFound++;

				if (!existingJob) {
					await prisma.job.create({
						data: {
							userId: user.id,
							role: job.title,
							company: job.company,
							loc: job.loc,
							salary: "Competitive",
							skills: finalSkillsString,
							url: job.url,
							score: finalScore,
							tier: tier,
							status: "active",
						},
					});
				} else {
					await prisma.job.update({
						where: { id: existingJob.id },
						data: {
							status: "active",
							score: finalScore,
							tier: tier,
							loc: job.loc,
							skills: finalSkillsString,
						},
					});
				}
			}
		}

		// 5. EMAIL DISPATCH (RESEND -> GMAIL FALLBACK ARCHITECTURE)
		let emailStatus = "run only";

		if (autoSend && validJobsForEmail.length > 0) {
			const topJobsForEmail = validJobsForEmail.sort(
				(a, b) => b.score - a.score,
			);

			let isPriorityEvent = false;
			let priorityMatchesCount = 0;

			if (isAlertsActive) {
				const kwList = alertKeywords
					? alertKeywords
							.toLowerCase()
							.split(",")
							.map((k: string) => k.trim())
							.filter(Boolean)
					: [];

				const hitJobs = topJobsForEmail.filter((j) => {
					if (alertTier === "Tier 1 Only" && j.tier !== 1) return false;
					if (alertTier === "Tier 1 & Tier 2" && j.tier > 2) return false;

					if (kwList.length > 0) {
						const textToSearch =
							`${j.title} ${j.company} ${j.skills} ${j.desc}`.toLowerCase();
						return kwList.some((kw: string) => textToSearch.includes(kw));
					}
					return true;
				});

				if (hitJobs.length > 0) {
					isPriorityEvent = true;
					priorityMatchesCount = hitJobs.length;
				}
			}

			const subjectLine = isPriorityEvent
				? `🚨 PRIORITY ALERT: ${priorityMatchesCount} Targeted Matches Found - BenchScout`
				: `Your BenchScout Job Digest - ${topJobsForEmail.length} New Matches`;

			const t1Jobs = topJobsForEmail.filter((j) => j.tier === 1);
			const t2Jobs = topJobsForEmail.filter((j) => j.tier === 2);
			const t3Jobs = topJobsForEmail.filter((j) => j.tier === 3);

			const renderJobsHtml = (
				jobsArray: any[],
				tierColor: string,
				titleColor: string,
			) => {
				return jobsArray
					.map(
						(j) => `
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; background-color: #ffffff; border-left: 4px solid ${tierColor};">
            <div style="font-weight: 800; color: #0f172a; font-size: 16px;">${j.title}</div>
            <div style="color: #0369a1; font-size: 14px; font-weight: 700; margin: 8px 0;">${j.company} • ${j.loc}</div>
            <table style="width: 100%; margin-top: 16px; border-collapse: collapse;">
              <tr>
                <td style="font-size: 13px; color: #64748b; font-weight: 600;">
                  Match Score: <strong style="color: ${tierColor}; font-size: 15px;">${j.score}%</strong>
                </td>
                <td style="text-align: right;">
                  <a href="${j.url}" style="color: #0058bc; font-size: 13px; font-weight: 700; text-decoration: none;">Apply Online &rarr;</a>
                </td>
              </tr>
            </table>
          </div>
        `,
					)
					.join("");
			};

			const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px;">
             <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">
                <span style="color: #0f172a;">Bench</span><span style="color: #0058bc;">Scout</span>
             </h1>
             <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">
                Job Digest
             </p>
          </div>
          
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Hello ${user.name.split(" ")[0]},<br/><br/>
            The system identified <strong>${topJobsForEmail.length}</strong> new clinical opportunities matched to your specific laboratory parameters.
          </p>
          
          ${
						isPriorityEvent
							? `
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <h2 style="color: #b91c1c; margin: 0 0 8px 0; font-size: 16px;">🚨 Priority Alert Triggered</h2>
              <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.5;">We found <strong>${priorityMatchesCount}</strong> new positions matching your exact priority criteria. Check the matches below immediately.</p>
            </div>
          `
							: ""
					}
          
          ${
						t1Jobs.length > 0
							? `
            <div style="margin-bottom: 24px;">
              <div style="background: #15803d; color: white; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-block; margin-bottom: 16px; letter-spacing: 0.5px;">
                TIER 1 MATCHES
              </div>
              ${renderJobsHtml(t1Jobs, "#15803d", "#15803d")}
            </div>
          `
							: ""
					}

          ${
						t2Jobs.length > 0
							? `
            <div style="margin-bottom: 24px;">
              <div style="background: #0284c7; color: white; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-block; margin-bottom: 16px; letter-spacing: 0.5px;">
                TIER 2 MATCHES
              </div>
              ${renderJobsHtml(t2Jobs, "#0284c7", "#0284c7")}
            </div>
          `
							: ""
					}

          ${
						t3Jobs.length > 0
							? `
            <div style="margin-bottom: 24px;">
              <div style="background: #94a3b8; color: white; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-block; margin-bottom: 16px; letter-spacing: 0.5px;">
                TIER 3 MATCHES
              </div>
              ${renderJobsHtml(t3Jobs, "#94a3b8", "#94a3b8")}
            </div>
          `
							: ""
					}

          <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
            This digest was automatically generated by BenchScout.<br/>
            You can update your email preferences in System Settings.
          </div>
        </div>
      `;

			try {
				const { error } = await resend.emails.send({
					from: "BenchScout <onboarding@resend.dev>",
					to: targetEmail,
					subject: subjectLine,
					html: emailHtml,
				});

				if (error) {
					throw new Error("Resend API failed: " + error.message);
				}

				emailStatus = "sent";
			} catch (emailError) {
				console.log(
					"Resend delivery failed. Initiating Gmail SMTP Fallback...",
					emailError,
				);

				try {
					if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
						throw new Error("Gmail credentials missing in .env");
					}

					const transporter = nodemailer.createTransport({
						service: "gmail",
						auth: {
							user: process.env.GMAIL_USER,
							pass: process.env.GMAIL_APP_PASSWORD,
						},
					});

					await transporter.sendMail({
						from: `"BenchScout Alert" <${process.env.GMAIL_USER}>`,
						to: targetEmail,
						subject: subjectLine,
						html: emailHtml,
					});

					emailStatus = "sent (fallback)";
				} catch (fallbackError) {
					console.error("Gmail Fallback also failed:", fallbackError);
					emailStatus = "failed";
				}
			}
		}

		// 6. RECORD THE RUN IN HISTORY
		await prisma.runHistory.create({
			data: {
				userId: user.id,
				matches: newJobsFound,
				t1Count: validJobsForEmail.filter((j) => j.tier === 1).length,
				trigger: request.headers.get("user-agent")?.includes("node")
					? "Automated"
					: "Manual",
				status: emailStatus,
			},
		});

		return NextResponse.json({
			success: true,
			message: `Scan complete. Found ${newJobsFound} NEW matches.`,
		});
	} catch (error) {
		console.error("Critical Engine Error:", error);
		return NextResponse.json(
			{ success: false, error: "System encountered an error." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
