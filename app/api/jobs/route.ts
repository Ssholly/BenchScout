import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");
		const employerId = searchParams.get("employerId");

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
				where: { isDirectPost: true, NOT: { status: "cleared" } },
				orderBy: { score: "desc" },
			});
			return NextResponse.json(globalJobs);
		}

		// 🚀 CANDIDATE FETCH: Verify User
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });

		// 🚀 NEW: Fetch the user's active CRM Invitations to cross-reference
		const invites = await prisma.notification.findMany({
			where: {
				userId: user.id,
				title: "Exclusive Recruitment Invitation",
			},
		});

		// Fetch the jobs array
		const jobs = await prisma.job.findMany({
			where: {
				OR: [{ userId: user.id }, { isDirectPost: true }],
				NOT: { status: "cleared" },
			},
			include: {
				applications: { where: { userId: user.id } }, // Check their inbox records
			},
			orderBy: { score: "desc" },
		});

		// Merge standard applied status with B2B ATS applied status + VIP Scout flag
		const formattedJobs = jobs.map((job) => {
			// If the system finds a notification message containing this specific job's details, flag it as a VIP invite
			const isScoutedInvite = invites.some(
				(inv) =>
					inv.message.includes(job.company) && inv.message.includes(job.role),
			);

			return {
				...job,
				applied: job.applied || job.applications.length > 0,
				isScoutedInvite,
			};
		});

		return NextResponse.json(formattedJobs);
	} catch (error: any) {
		return NextResponse.json([]); // Prevents UI crashes
	} finally {
		await prisma.$disconnect();
	}
}
