import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const form = await request.formData();
		const file = form.get("file") as File;
		const email = form.get("email") as string;
		const documentType = form.get("documentType") as string;

		if (!file || !email || !documentType) {
			return NextResponse.json(
				{ error: "Missing file, email, or documentType" },
				{ status: 400 },
			);
		}

		const token = process.env.BLOB_READ_WRITE_TOKEN;
		if (!token) {
			return NextResponse.json(
				{ error: "Server configuration error: Token missing." },
				{ status: 500 },
			);
		}

		let extractedText = null;
		if (documentType === "resume") {
			try {
				console.log(`\n--- GEMINI VISION DIAGNOSTICS ---`);
				console.log(`Intercepting CV (Name: ${file.name})...`);

				const apiKey = process.env.GEMINI_API_KEY;
				if (!apiKey)
					throw new Error("Missing Gemini API Key for OCR extraction.");

				const arrayBuffer = await file.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				const base64Data = buffer.toString("base64");

				// 🚀 THE PIVOT: Use Gemini's native OCR to read the PDF
				console.log(`Sending file to Gemini Vision Engine for OCR...`);
				const genAI = new GoogleGenerativeAI(apiKey);
				const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

				const prompt =
					"You are a highly precise document scanner. Extract all the text from this resume exactly as it appears. Do not summarize. Do not format. Just return the raw text.";

				const result = await model.generateContent([
					prompt,
					{
						inlineData: {
							data: base64Data,
							mimeType: "application/pdf",
						},
					},
				]);

				extractedText = result.response.text();

				if (extractedText && extractedText.trim().length > 10) {
					console.log(
						`✅ SUCCESS: Gemini Vision read ${extractedText.split(/\s+/).length} words seamlessly.`,
					);
				} else {
					console.log(
						`⚠️ WARNING: Gemini could not read any text from this document.`,
					);
				}
				console.log(`---------------------------------\n`);
			} catch (visionError: any) {
				console.error(
					"❌ Gemini Vision Extraction failed:",
					visionError.message || visionError,
				);
			}
		}

		const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
		const finalName = `${Date.now()}-${safeFilename}`;

		const blob = await put(finalName, file, {
			access: "public",
			token: token,
		});

		const updateData: any = {};
		if (documentType === "resume") {
			updateData.resumeUrl = blob.url;
			if (extractedText && extractedText.trim().length > 10) {
				updateData.cvParsedText = extractedText;
			}
		}
		if (documentType === "license") updateData.licenseUrl = blob.url;
		if (documentType === "degree") updateData.degreeUrl = blob.url;

		await prisma.user.update({
			where: { email },
			data: updateData,
		});

		return NextResponse.json({
			success: true,
			url: blob.url,
			message: `${documentType} successfully secured in The Vault.`,
		});
	} catch (error: any) {
		console.error("DIAGNOSTIC UPLOAD ERROR:", error.message || error);
		return NextResponse.json(
			{
				error: `Diagnostic Error: ${error.message || "Unknown backend error"}`,
			},
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
