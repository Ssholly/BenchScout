import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// 1. GET: Fetch and filter all verified passive lab scientists
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const location = searchParams.get("location") || "";

		const whereClause: any = {};
		if (location) {
			whereClause.loc = { contains: location, mode: "insensitive" };
		}

		const users = await prisma.user.findMany({
			where: whereClause,
			select: {
				id: true,
				name: true,
				email: true,
				licenseUrl: true,
				degreeUrl: true,
				resumeUrl: true,
			},
			orderBy: { name: "asc" },
		});

		return NextResponse.json({ success: true, users });
	} catch (error) {
		console.error("Talent CRM Fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to query system talent registry" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

// 2. POST: Dispatch an explicit recruitment invite node to passive talent
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			candidateId,
			candidateEmail,
			candidateName,
			employerName,
			jobRole,
		} = body;

		if (!candidateId || !employerName || !jobRole) {
			return NextResponse.json(
				{ error: "Missing parameters" },
				{ status: 400 },
			);
		}

		// Create a native system notification for the topbar bell icon
		await prisma.notification.create({
			data: {
				userId: candidateId,
				title: "Exclusive Recruitment Invitation",
				message: `${employerName} has scouted your verified credentials and personally invited you to apply for their opening: ${jobRole}.`,
			},
		});

		// Fire background priority email safely
		if (candidateEmail) {
			const transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: process.env.EMAIL_USER,
					pass: process.env.EMAIL_PASS,
				},
			});

			const safeEmployer = employerName.replace(/"/g, "'");
			const safeRole = jobRole.replace(/"/g, "'");
			const safeName = (candidateName || "Scientist").replace(/"/g, "'");

			const mailOptions = {
				from: `"BenchScout Sourcing" <${process.env.EMAIL_USER}>`,
				to: candidateEmail,
				subject: `HEADHUNTING NOTICE: Exclusive invite from ${safeEmployer}`,
				html:
					"<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; border-radius: 16px;'><div style='text-align: center; margin-bottom: 30px;'><h2 style='color: #0B2444; margin: 0; font-size: 28px;'>Bench<span style='color: #1A8C7A;'>Scout</span></h2></div><div style='background-color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0; border-top: 4px solid #0B2444; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'><p style='color: #1A8C7A; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;'>⚡ Exclusive Fast-Track Invite</p><h2 style='color: #0B2444; margin: 0 0 20px 0;'>You have been scouted, " +
					safeName +
					".</h2><p style='color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;'>Medical talent acquisition managers at <strong>" +
					safeEmployer +
					"</strong> have processed your verified MLSCN credentials and portfolio layout across the network directory.</p><p style='color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;'>They are fast-tracking you for consideration for their <strong>" +
					safeRole +
					"</strong> placement hub.</p><div style='background: #e6fcf5; padding: 15px; border-radius: 8px; border-left: 4px solid #1A8C7A; margin-bottom: 25px; color: #065f46; font-size: 14px; font-weight: 600;'>Log into your BenchScout dashboard, review their deployment metrics, and accept the node path to establish instant transmission.</div></div><p style='color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;'>BenchScout B2B CRM Engine &copy; 2026</p></div>",
			};

			// Execute without awaiting to keep API response fast
			transporter.sendMail(mailOptions).catch((err) => {
				console.error("CRM Background Email Failure:", err);
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to log invite" },
			{ status: 500 },
		);
	}
}