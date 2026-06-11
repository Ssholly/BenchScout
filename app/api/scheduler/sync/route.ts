import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json(
				{ error: "Email parameter required" },
				{ status: 400 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return NextResponse.json({ success: true, employerEvents: [] });
		}

		// Fetch applications where the status is explicitly 'shortlisted'
		const shortlistedApplications = await prisma.application.findMany({
			where: {
				userId: user.id,
				status: "shortlisted",
			},
			include: {
				job: true,
			},
		});

		// Map database rows into the clean 'action' calendar card protocol dynamically
		const employerEvents = shortlistedApplications.map((app) => {
			let targetDay = new Date().getDate() + 1; // Default fallback fallback
			let formattedTime = "10:00 AM";

			// 🚀 Parse dynamic date string from employer input (e.g., "2026-06-15")
			if (app.interviewDate) {
				const parsedDate = new Date(app.interviewDate);
				if (!isNaN(parsedDate.getTime())) {
					targetDay = parsedDate.getDate();
				}
			}

			// 🚀 Format 24H string (e.g., "11:00" or "14:30") to matching AM/PM for timeline grid
			if (app.interviewTime) {
				const [h, m] = app.interviewTime.split(":");
				const hours = parseInt(h, 10);
				if (!isNaN(hours)) {
					const ampm = hours >= 12 ? "PM" : "AM";
					const displayHours = hours % 12 || 12;
					formattedTime = `${displayHours.toString().padStart(2, "0")}:${m || "00"} ${ampm}`;
				}
			}

			return {
				id: `b2b-${app.id}`,
				date: targetDay,
				time: formattedTime,
				title: `Confirmed Interview: ${app.job?.role || "Clinical Assessment"}`,
				company: app.job?.company || "BenchScout Partner",
				type: "action", // Keeps signature teal rendering
				location: app.interviewLoc || app.job?.loc || "Platform Gateway",
			};
		});

		return NextResponse.json({ success: true, employerEvents });
	} catch (error) {
		console.error("Scheduler sync crash:", error);
		return NextResponse.json({ error: "Internal sync error" }, { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
}
