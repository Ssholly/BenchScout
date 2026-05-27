import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🚀 A Retry function to survive Neon Database "Cold Starts"
async function withRetry<T>(
	operation: () => Promise<T>,
	maxRetries = 3,
): Promise<T> {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await operation();
		} catch (error: any) {
			if (i === maxRetries - 1) throw error;
			console.warn(
				`Database asleep. Retrying operation... (${i + 1}/${maxRetries})`,
			);
			await new Promise((res) => setTimeout(res, 1500)); // Wait 1.5s for DB to wake up
		}
	}
	throw new Error("Unreachable");
}

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const email = formData.get("email") as string;
		const documentType = formData.get("documentType") as string;

		if (!file || !email || !documentType) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const blob = await put(file.name, file, { access: "public" });

		const updateData: any = {};
		if (documentType === "resume") updateData.resumeUrl = blob.url;
		if (documentType === "license") updateData.licenseUrl = blob.url;
		if (documentType === "degree") updateData.degreeUrl = blob.url;
		if (documentType === "avatar") updateData.avatarUrl = blob.url;

		// Execute with Retry
		const user = await withRetry(() =>
			prisma.user.update({
				where: { email },
				data: updateData,
			}),
		);

		return NextResponse.json({ success: true, url: blob.url, user });
	} catch (error: any) {
		console.error("Upload/DB Error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to process upload." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
