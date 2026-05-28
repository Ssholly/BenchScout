import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		// 1. Clear out any old data so we don't create duplicates if you run this twice
		await prisma.job.deleteMany({});
		await prisma.user.deleteMany({});

		// 2. Create your User Profile
		const user = await prisma.user.create({
			data: {
				email: "success.sholly@icloud.com",
				name: "Success O. Ishola",
				location: "Abuja, Nigeria",
				keywords: "Medical Laboratory Scientist, Haematology, Blood Bank",
				password: "hashed_password_placeholder", // Dummy password for setup
			},
		});

		// 3. Insert the Job Matches and link them to your User ID
		await prisma.job.createMany({
			data: [
				{
					userId: user.id,
					tier: 1,
					role: "MLS – Blood Banks",
					company: "AMCE / Deloitte HC",
					loc: "Abuja",
					salary: "₦450k–600k/mo",
					skills: "Blood Banking, Transfusion, LIS, QC",
					url: "#",
					score: 97,
				},
				{
					userId: user.id,
					tier: 1,
					role: "MLS / Microbiologist",
					company: "AMCE / Deloitte HC",
					loc: "Abuja",
					salary: "₦400k–550k/mo",
					skills: "Microbiology, LIS, QMS",
					url: "#",
					score: 93,
				},
				{
					userId: user.id,
					tier: 2,
					role: "Laboratory Co-ordinator",
					company: "EHA Clinics",
					loc: "Abuja",
					salary: "₦490,000/mo",
					skills: "Coordination, Lab Science",
					url: "#",
					score: 85,
				},
				{
					userId: user.id,
					tier: 2,
					role: "Medical Laboratory Scientist",
					company: "MSI Nigeria",
					loc: "Utako, Abuja",
					salary: "Not disclosed",
					skills: "Phlebotomy, Haematology",
					url: "#",
					score: 81,
				},
				{
					userId: user.id,
					tier: 3,
					role: "Medical Lab Scientist",
					company: "St. Mary's Hospital",
					loc: "Enugu",
					salary: "Not disclosed",
					skills: "NYSC, MLSCN",
					url: "#",
					score: 62,
				},
			],
		});

		return NextResponse.json({
			success: true,
			message:
				"Database successfully seeded with your profile and initial jobs!",
		});
	} catch (error) {
		console.error("Database error:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to setup database" },
			{ status: 500 },
		);
	}
}
