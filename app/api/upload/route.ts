import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob"; // 🚀 Added 'del' for the delete handler
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

		// 🚀 THE BLOB FIX: addRandomSuffix prevents the Vercel Blob name collision entirely
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
		if (documentType === "degree") updateData.degreeUrl = blob.url;
		if (documentType === "avatar") updateData.avatarUrl = blob.url;

		// 🚀 SCHEMA ALIGNMENT: Save URL and reset verification status so they must confirm
		if (documentType === "license") {
			updateData.licenseUrl = blob.url;
			updateData.isLicenseVerified = false;
		}

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

// 🚀 NEW DELETE HANDLER: Permanently wipes files from Vercel Blob & Database
export async function DELETE(request: Request) {
	try {
		const { email, documentType, fileUrl } = await request.json();

		if (!email || !documentType) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// 1. Delete the actual file from Vercel Cloud Storage
		if (fileUrl) {
			await del(fileUrl);
		}

		// 2. Prepare the database wipe command
		const updateData: any = {};

		if (documentType === "resume") updateData.resumeUrl = null;
		if (documentType === "degree") updateData.degreeUrl = null;
		if (documentType === "avatar") updateData.avatarUrl = null;

		// Wipe all license data entirely
		if (documentType === "license") {
			updateData.licenseUrl = null;
			updateData.licenseNumber = null;
			updateData.licenseExpiry = null;
			updateData.isLicenseVerified = false;
		}

		// 3. Execute the database update using your retry wrapper
		const user = await withRetry(() =>
			prisma.user.update({
				where: { email },
				data: updateData,
			}),
		);

		return NextResponse.json({
			success: true,
			message: `${documentType} deleted successfully`,
		});
	} catch (error: any) {
		console.error("Delete Error:", error);
		return NextResponse.json(
			{ error: "Failed to delete document from server." },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
