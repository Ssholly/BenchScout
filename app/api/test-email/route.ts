import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		// Attempt to send a tiny test email to yourself
		const info = await transporter.sendMail({
			from: `"LabPro Debugger" <${process.env.EMAIL_USER}>`,
			to: process.env.EMAIL_USER, // Sending it to the same email address
			subject: "LabPro Connect: Connection Successful!",
			text: "If you are reading this, your Next.js app has successfully connected to Google's SMTP servers.",
		});

		console.log("SUCCESS! Email sent:", info.messageId);
		return NextResponse.json({ success: true, messageId: info.messageId });
	} catch (error) {
		// This will print the EXACT reason it is failing to your terminal
		console.error("🔥 NODEMAILER ERROR 🔥:", error);
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
