import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { resumeId, jobDescription } = await req.json();

        if (!resumeId || !jobDescription) {
            return NextResponse.json({ error: "Missing resumeId or jobDescription" }, { status: 400 });
        }

        // 1. Read the parsed resume text from the local JSON file
        const jsonPath = path.join(process.cwd(), "public", "uploads", `${resumeId}.json`);
        if (!existsSync(jsonPath)) {
            return NextResponse.json({ error: "Resume not found or not parsed." }, { status: 404 });
        }

        const fileContent = await readFile(jsonPath, "utf-8");
        const resumeMetadata = JSON.parse(fileContent);
        const resumeText = resumeMetadata.extractedText;

        if (!resumeText) {
            return NextResponse.json({ error: "Resume text could not be extracted earlier." }, { status: 400 });
        }

        // 2. Initialize Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 3. Prompt Engineering
        const prompt = `
You are an expert technical recruiter and ATS system. Your job is to analyze the following resume against the provided job description and return ONLY a valid JSON object. Do not wrap the JSON in markdown code blocks like \`\`\`json. Just return the raw JSON object.

Job Description:
"""
${jobDescription}
"""

Resume Text:
"""
${resumeText}
"""

Return ONLY a valid JSON object matching this exact schema, with no additional text or formatting:
{
  "skillMatchScore": number (0-100),
  "atsScore": number (0-100, based on formatting structure readability and key buzzwords),
  "matchedSkills": [array of strings representing core skills found in both],
  "missingSkills": [array of strings representing critical skills in JD but missing in Resume],
  "summary": "string (A 2-3 paragraph professional recruiter summary of the candidate's fit for the role. Use markdown formatting like bolding for emphasis, tailored exclusively for the recruiter)"
}
`;

        // 4. Call Gemini
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. Parse Gemini's JSON response
        let analysisData;
        try {
            // Strip out any potential markdown code blocks if the AI ignored the instruction
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            analysisData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", responseText);
            return NextResponse.json({ error: "Failed to parse AI response. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ success: true, analysis: analysisData });
    } catch (error: any) {
        console.error("Analyze error:", error);
        return NextResponse.json({ error: error.message || "Analysis failed." }, { status: 500 });
    }
}
