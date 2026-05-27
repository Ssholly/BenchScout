import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
			await new Promise((res) => setTimeout(res, 1500));
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

		// 🚀 THE BLOB FIX: addRandomSuffix: true prevents the Vercel Blob name collision entirely
		const blob = await put(
			`users/${email}/${documentType}-${file.name}`,
			file,
			{
				access: "public",
				addRandomSuffix: true,
			},
		);

		const updateData: any = {};
		if (documentType === "resume") updateData.resumeUrl = blob.url;
		if (documentType === "avatar") updateData.avatarUrl = blob.url;
		if (documentType === "degree") updateData.degreeUrl = blob.url;

		// 🚀 SCHEMA ALIGNMENT FIX: Map "license" cleanly to your User schema file properties
		if (documentType === "license") {
			updateData.isLicenseVerified = false; // Reset status verification flags until user clicks Confirm
		}

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
