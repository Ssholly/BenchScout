import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const jobId = searchParams.get("jobId");

		if (!jobId) {
			return NextResponse.json(
				{ error: "Missing jobId parameters." },
				{ status: 400 },
			);
		}

		const applications = await prisma.application.findMany({
			where: { jobId: jobId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						licenseUrl: true,
						provisionalUrl: true,
						degreeUrl: true,
						resumeUrl: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json({ success: true, applications });
	} catch (error) {
		console.error("Fetch applicants error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch applicants." },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const { jobId } = await request.json();
		await prisma.application.deleteMany({
			where: { jobId: jobId },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
	}
}

export async function PATCH(request: Request) {
	try {
		const body = await request.json();
		// 🚀 NEW: Extracting the interview parameters
		const {
			applicationId,
			status,
			interviewDate,
			interviewTime,
			interviewLoc,
		} = body;

		if (!applicationId || !status) {
			return NextResponse.json(
				{ error: "Missing parameters" },
				{ status: 400 },
			);
		}

		// 1. Update database with status AND interview details
		const updatedApp = await prisma.application.update({
			where: { id: applicationId },
			data: {
				status,
				interviewDate: interviewDate || null,
				interviewTime: interviewTime || null,
				interviewLoc: interviewLoc || null,
			},
		});

		// 2. Fetch details for email & notifications
		const candidate = await prisma.user.findUnique({
			where: { id: updatedApp.userId },
		});
		const job = await prisma.job.findUnique({
			where: { id: updatedApp.jobId },
		});

		const employerName = job?.company || "A BenchScout Partner Hospital";
		const candidateName = candidate?.name || "BenchScout Scientist";
		const jobRole = job?.role || "Medical Laboratory Scientist";

		// 3. 🚀 NEW: Create Native Platform Notification
		if (status === "shortlisted" && candidate) {
			await prisma.notification.create({
				data: {
					userId: candidate.id,
					title: "Priority: Interview Scheduled",
					message: `${employerName} has scheduled your interview for ${jobRole} on ${interviewDate} at ${interviewTime}. Location: ${interviewLoc}`,
				},
			});
		}

		// 4. Isolate the Email Dispatch in the background
		if (status === "shortlisted" && candidate?.email) {
			(async () => {
				try {
					const transporter = nodemailer.createTransport({
						service: "gmail",
						auth: {
							user: process.env.EMAIL_USER,
							pass: process.env.EMAIL_PASS,
						},
					});

					const mailOptions = {
						from: `"BenchScout Priority" <${process.env.EMAIL_USER}>`,
						to: candidate.email,
						subject: `ACTION REQUIRED: Interview Scheduled for ${jobRole}`,
						html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="color: #0B2444; margin: 0; font-size: 28px;">Bench<span style="color: #1A8C7A;">Scout</span></h2>
                </div>
                <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0; border-top: 4px solid #1A8C7A; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                  <p style="color: #ef4444; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">🔴 Priority Action Required</p>
                  <h2 style="color: #0B2444; margin: 0 0 20px 0;">Interview Confirmed, ${candidateName}.</h2>
                  <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                    <strong>${employerName}</strong> has shortlisted you and locked in your clinical interview schedule. Please review your agenda details below:
                  </p>
                  
                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
                    <div style="margin-bottom: 12px;">
                      <span style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Date:</span><br/>
                      <strong style="color: #0f172a; font-size: 16px;">${interviewDate}</strong>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <span style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Time:</span><br/>
                      <strong style="color: #0f172a; font-size: 16px;">${interviewTime}</strong>
                    </div>
                    <div>
                      <span style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Location / Link:</span><br/>
                      <strong style="color: #1A8C7A; font-size: 16px;">${interviewLoc}</strong>
                    </div>
                  </div>
                  
                  <p style="color: #334155; font-size: 14px; margin: 0;">This event has been automatically added to your Master Scheduler. Log into your BenchScout portal to view it.</p>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
                  BenchScout Placement Network &copy; 2026<br />
                  This is an automated priority dispatch.
                </p>
              </div>
            `,
					};

					await transporter.sendMail(mailOptions);
					console.log("Priority Interview Email dispatched successfully.");
				} catch (emailErr) {
					console.error("BACKGROUND EMAIL ERROR:", emailErr);
				}
			})();
		}

		return NextResponse.json({ success: true, application: updatedApp });
	} catch (error) {
		console.error("Update application status error:", error);
		return NextResponse.json(
			{ error: "Failed to update status" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
