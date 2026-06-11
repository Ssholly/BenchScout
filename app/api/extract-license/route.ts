import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
	try {
		if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file)
			return NextResponse.json({ error: "No file provided" }, { status: 400 });

		// 🚀 REMOVED THE PDF BLOCKER. Gemini 1.5 handles application/pdf perfectly!

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		const documentPart = {
			inlineData: { data: buffer.toString("base64"), mimeType: file.type },
		};

		const prompt = `
      Extract the following information from this Nigerian Medical Laboratory Science Council license document.
      If a field is unreadable, return "Not Found".
      Return strictly this JSON structure and absolutely nothing else:
      {
        "licenseNumber": "Registration Number or RA number",
        "expiryDate": "YYYY-MM-DD",
        "fullName": "Name of the scientist"
      }
    `;

		// 🚀 Ensured 1.5 is at the top of the array since it handles PDFs natively
		const modelsToTry = [
			"gemini-1.5-flash",
			"gemini-2.5-flash",
			"gemini-1.5-pro",
		];

		let text = "";
		let lastError = null;

		for (const modelName of modelsToTry) {
			try {
				const model = genAI.getGenerativeModel({ model: modelName });
				const result = await model.generateContent([prompt, documentPart]);
				text = result.response.text();
				break; // Stop loop on success
			} catch (e: any) {
				lastError = e;
			}
		}

		if (!text) throw new Error(lastError?.message || "AI Models unavailable.");

		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) throw new Error(`AI returned invalid format: ${text}`);

		return NextResponse.json({ success: true, data: JSON.parse(jsonMatch[0]) });
	} catch (error: any) {
		console.error("🔥 CRITICAL VISION ERROR:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}