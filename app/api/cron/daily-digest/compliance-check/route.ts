import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function GET(request: Request) {
	try {
		// Basic Auth Check: Ensure cron checks are secure from anonymous external pings
		const { searchParams } = new URL(request.url);
		const secret = searchParams.get("secret");
		if (secret !== process.env.CRON_SECRET) {
			return NextResponse.json(
				{ error: "Unauthorized access token" },
				{ status: 401 },
			);
		}

		// 1. Fetch all users who have an active license configured
		const users = await prisma.user.findMany({
			where: {
				licenseExpiry: { not: null },
				isVerified: true,
			},
			select: {
				email: true,
				name: true,
				licenseExpiry: true,
				licenseNumber: true,
			},
		});

		const today = new Date();
		const emailTransporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.GMAIL_USER, // Your app's notification email address
				pass: process.env.GMAIL_APP_PASSWORD, // The Gmail App password saved in settings
			},
		});

		let emailsDispatched = 0;

		// 2. Loop through users and calculate expiring horizons
		for (const user of users) {
			const expiryDate = new Date(user.licenseExpiry!);
			const timeDifference = expiryDate.getTime() - today.getTime();
			const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

			// Trigger high-priority email warning at exactly 30 days remaining
			if (daysRemaining === 30) {
				const mailOptions = {
					from: `"BenchScout Compliance Portal" <${process.env.GMAIL_USER}>`,
					to: user.email,
					subject:
						"⚠️ ACTION REQUIRED: Your MLSCN Practicing License Expires in 30 Days",
					html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #dc2626; margin-top: 0;">Urgent Licensure Compliance Notice</h2>
              <p>Hello ${user.name},</p>
              <p>This is an automated compliance alert from BenchScout. Your **Medical Laboratory Science Council of Nigeria (MLSCN)** practicing license is reaching its expiration horizon.</p>
              
              <div style="background: #f8fafc; padding: 1.25rem; border-radius: 12px; margin: 1.5rem 0; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 6px 0;"><strong>License Number:</strong> ${user.licenseNumber}</p>
                <p style="margin: 0 0 6px 0;"><strong>Expiration Date:</strong> ${expiryDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p style="margin: 0; color: #dc2626; font-weight: bold;">Timeline Constraint: Exactly 30 Days Remaining</p>
              </div>

              <p>To avoid career matching interruptions and to remain fully cleared for clinical laboratory practice, please ensure you complete your annual renewal cycle via the Remita gateway and log your required **30 CPD credits**.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="display: inline-block; background: #0058bc; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 1rem;">Upload Renewed License</a>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
              <p style="color: #64748b; font-size: 12px; margin: 0;">BenchScout Career Automation Engine • Lagos, Nigeria</p>
            </div>
          `,
				};

				await emailTransporter.sendMail(mailOptions);
				emailsDispatched++;
			}
		}

		return NextResponse.json({
			success: true,
			processedCount: users.length,
			dispatchedCount: emailsDispatched,
		});
	} catch (error: any) {
		console.error("Cron Process Failure:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
