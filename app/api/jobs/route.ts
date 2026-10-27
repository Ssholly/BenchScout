import { selectedDocumentKinds } from "@/lib/application-documents";
import { legacyPortalUrls } from "@/lib/job-matching";
import { opportunityForPhase, opportunityForPreferences, internshipApproval, lastScan, candidateProfile } from "@/lib/candidate-profile";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export const GET = withApi("either", async (request: Request, session: import("@/lib/auth").Session | null) => {


		const email = session!.role === "candidate" ? session!.email : null;
		const employerId = session!.role === "employer" ? session!.id : null;

		// 🚀 EMPLOYER FETCH: Include a raw count of all ATS applications!
		if (employerId) {
			const employerJobs = await prisma.job.findMany({
				where: { employerId: employerId },
				include: {
					_count: {
						select: { applications: true }, // Asks DB to count applicants
					},
				},
				orderBy: { createdAt: "desc" },
			});
			return NextResponse.json(employerJobs);
		}

		// Legacy Global Fetch
		if (!email) {
			const globalJobs = await prisma.job.findMany({
				where: { isDirectPost: true, employer: { isVerified: true }, status: "active" },
				orderBy: { score: "desc" },
			});
			return NextResponse.json(globalJobs);
		}

		// 🚀 CANDIDATE FETCH: Verify User
		const userId = session!.id;
        const pipeline = new URL(request.url).searchParams.get("view") === "pipeline";

		// 🚀 NEW: Fetch the user's active CRM Invitations to cross-reference
		const invitesPromise = pipeline ? Promise.resolve([]) : prisma.notification.findMany({
			where: {
				userId,
				title: "Exclusive Recruitment Invitation",
			},
		});

		// Fetch the jobs array
		const jobsPromise = prisma.job.findMany({
			where: {
				OR: pipeline ? [{ userId, applied: true }, { isDirectPost: true, applications: { some: { userId } } }] : [{ userId }, { isDirectPost: true }],
				NOT: { status: "cleared" },
			},
			include: {
				applications: { where: { userId }, select: { documentSelection: true, status: true, interviewDate: true, interviewTime: true, interviewLoc: true } },
				employer: { select: { isVerified: true } }, // Check their inbox records
			},
			orderBy: { score: "desc" },
		});

        const [invites, jobs] = await Promise.all([invitesPromise, jobsPromise]);
        const scan = lastScan(session!.candidateProfile);
        const discoveryProfile = candidateProfile(session!.candidateProfile);
        // A completed manual scan has its own scope; saved profile preferences must not hide it.
        if (scan && scan.careerPhase === session!.careerPhase) discoveryProfile.preferredLocations = scan.location;
		// Merge standard applied status with B2B ATS applied status + VIP Scout flag
		const formattedJobs = jobs.filter(job => job.applied || job.applications.length > 0 || ((!job.isDirectPost || job.employer?.isVerified === true) && !legacyPortalUrls.includes(job.url) && opportunityForPhase(job, session!.careerPhase || "licensed") && opportunityForPreferences(job, session!.careerPhase || "licensed", discoveryProfile, session!.location) && job.status === "active")).map((job) => {
			// If the system finds a notification message containing this specific job's details, flag it as a VIP invite
			const isScoutedInvite = invites.some(
				(inv) =>
					inv.message.includes(job.company) && inv.message.includes(job.role),
			);

			return {
				...job,
                applications: job.applications.map(({documentSelection,...application})=>({...application,selectedDocumentKinds:selectedDocumentKinds(documentSelection)})),
                isMlscnApproved: internshipApproval(job),
				applied: job.applied || job.applications.length > 0,
				isScoutedInvite,
				listingSource: job.isDirectPost ? "Employer posted" : "External listing",
				employerVerified: job.employer?.isVerified === true,
				lastSeenAt: job.lastSeenAt,
				matchExplanation: job.isDirectPost ? "Posted by this employer; not a personalized match score." : "Keyword and location relevance; confirm requirements on the source listing.",
			};
		});

		return NextResponse.json(formattedJobs);
}, {});
