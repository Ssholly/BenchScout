import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email, jobId } = body;

		if (!email || !jobId) {
			return NextResponse.json(
				{ error: "Missing email or jobId" },
				{ status: 400 },
			);
		}

		// 1. Authenticate the Gemini Engine
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "AI Engine Offline: Missing Gemini API Key in .env" },
				{ status: 500 },
			);
		}

		// 2. Retrieve the Applicant's memory
		// Added 'as any' to bypass the VS Code TypeScript lag
		const user = (await prisma.user.findUnique({ where: { email } })) as any;
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });

		if (!user.cvParsedText) {
			return NextResponse.json(
				{
					error:
						"No CV text found in memory. Please re-upload your Master CV in Settings.",
				},
				{ status: 400 },
			);
		}

		// 3. Retrieve the Target Job
		// Added 'as any' to bypass strict typing
		const job = (await prisma.job.findUnique({ where: { id: jobId } })) as any;
		if (!job)
			return NextResponse.json(
				{ error: "Job record not found" },
				{ status: 404 },
			);

		// 4. Boot up Gemini
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({
			model: "gemini-2.5-flash", // 🚀 FIX: Corrected model version typo
			systemInstruction:
				"You are an expert Medical Laboratory Scientist and elite career strategist.",
		});

		// 5. The Master Prompt Architecture 🚀 UPGRADED FOR 2-PARAGRAPH PRECISION
		const prompt = `You are an elite clinical career agent acting on behalf of ${user.name}, a Medical Laboratory Scientist.
    
    TARGET ROLE:
    Title: ${job.role}
    Company: ${job.company}
    Matched Skills: ${job.skills}

    APPLICANT'S REAL BACKGROUND (Extracted from CV):
    ${user.cvParsedText}

    CRITICAL RULES YOU MUST FOLLOW:
    1. Length Limit: The letter MUST be exactly TWO paragraphs long. No more, no less.
    2. No Regurgitation: Do NOT just list daily duties or summarize the resume. 
    3. Paragraph 1 (The Hook & Proof): Instantly establish the applicant's core expertise. Highlight 2-3 specific, high-level skills from their CV that make them perfect for this exact target role.
    4. Paragraph 2 (The Fit & Value): Connect their track record directly to what ${job.company} cares about (e.g., efficiency, accuracy, patient care). Close with a strong, confident call to action.
    5. Tone: Punchy, precise, professional, and highly confident. No fluff or generic buzzwords.
    6. Formatting: Do not include placeholder blocks like [Insert Date] or [Insert Address] at the top. Just output the pure letter body starting with a professional greeting (e.g., "Dear Hiring Team at ${job.company},") and ending with a sign-off from ${user.name}. 
    7. Accuracy: NEVER invent or hallucinate experience. Ground everything strictly in the provided CV.

    Write the customized cover letter now:`;

		console.log(
			`Generating Gemini Cover Letter for: ${job.role} at ${job.company}...`,
		);

		// 6. Execute the Generation
		const result = await model.generateContent(prompt);
		const letterText = result.response.text();

		console.log("Cover Letter generated successfully.");

		return NextResponse.json({ success: true, letter: letterText });
	} catch (error: any) {
		console.error("Critical Engine Error:", error);
		return NextResponse.json(
			{
				error: error.message || "The AI Engine failed to generate the letter.",
			},
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
