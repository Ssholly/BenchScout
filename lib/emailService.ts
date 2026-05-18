import nodemailer from "nodemailer";

// A resilient function to draft the email and push it to the queue
export async function queueWelcomeEmail(
	tx: any,
	email: string,
	name: string | null,
	token: string,
) {
	// Create the secure confirmation link
	const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`;

	// Format the BenchScout specific HTML email
	const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0b1c30;">
      <h2 style="color: #0058bc;">Welcome to BenchScout</h2>
      <p>Hello ${name || "Scientist"},</p>
      <p>Thank you for creating an account with BenchScout, your clinical MLS career hub.</p>
      <p>To ensure the security of your account and activate your automated job digest, please confirm your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmLink}" style="background-color: #0058bc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Verify Email Address
        </a>
      </div>
      
      <p style="font-size: 12px; color: #717786;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${confirmLink}" style="color: #0058bc;">${confirmLink}</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e8ecf5; margin: 30px 0;" />
      
      <p style="font-size: 11px; color: #717786;">
        <strong>Didn't create this account?</strong><br/>
        You can safely ignore and delete this email. Your email address will not be used, and the unverified account will be automatically purged from our system.
      </p>
    </div>
  `;

	// Save the email payload to the database queue within the transaction
	await tx.emailQueue.create({
		data: {
			emailTo: email,
			subject: "Action Required: Verify your BenchScout Account",
			htmlBody: htmlBody,
			status: "PENDING",
		},
	});

	// Fire off the background processor without awaiting it
	// This allows the API route to return instantly!
	processEmailQueue().catch(console.error);
}

// The background worker that actually talks to the SMTP server
export async function processEmailQueue() {
	// Normally you would import your Prisma client here
	const { PrismaClient } = require("@prisma/client");
	const prisma = new PrismaClient();

	// Find 5 pending emails
	const pendingEmails = await prisma.emailQueue.findMany({
		where: { status: "PENDING", retryCount: { lt: 3 } },
		take: 5,
	});

	if (pendingEmails.length === 0) return;

	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		secure: true,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});

	for (const email of pendingEmails) {
		try {
			await transporter.sendMail({
				from: '"BenchScout" <no-reply@benchscout.com>',
				to: email.emailTo,
				subject: email.subject,
				html: email.htmlBody,
			});

			// Mark as sent
			await prisma.emailQueue.update({
				where: { id: email.id },
				data: { status: "SENT" },
			});
		} catch (error) {
			// If it fails, increment retry count but leave as PENDING
			await prisma.emailQueue.update({
				where: { id: email.id },
				data: {
					retryCount: { increment: 1 },
					status: email.retryCount >= 2 ? "FAILED" : "PENDING",
				},
			});
		}
	}
}
