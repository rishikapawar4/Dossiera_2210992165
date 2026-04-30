import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, requiredSkills, customPrompt } = await req.json();

        if (!title || !requiredSkills) {
            return NextResponse.json({ error: "Job title and required skills are required." }, { status: 400 });
        }

        if (!genAI) {
            return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = `
You are an expert technical recruiter hiring for the role of "${title}".
The required skills for this role are: ${requiredSkills.join(", ")}.
`;

        if (customPrompt && customPrompt.trim().length > 0) {
            prompt += `\nThe hiring manager provided these specific instructions/focus areas for the interview: "${customPrompt}"\nEnsure your questions heavily incorporate this request.\n`;
        }

        prompt += `
Generate an interview question set specifically tailored for this role.
You MUST output raw JSON only, without any markdown formatting or backticks.
The JSON must perfectly match this structure exactly:
{
  "technicalQuestions": ["question 1", "question 2", "question 3", "question 4", "question 5"],
  "codingQuestions": ["question 1", "question 2", "question 3"],
  "behavioralQuestions": ["question 1", "question 2"]
}
`;

        const result = await model.generateContent(prompt);
        let rawAiResponse = result.response.text();

        // Clean markdown backticks if AI accidentally includes them
        rawAiResponse = rawAiResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        const parsedResponse = JSON.parse(rawAiResponse);

        return NextResponse.json({
            success: true,
            technicalQuestions: parsedResponse.technicalQuestions || [],
            codingQuestions: parsedResponse.codingQuestions || [],
            behavioralQuestions: parsedResponse.behavioralQuestions || []
        });

    } catch (error: any) {
        console.error("Generate Interview Questions Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate interview questions" }, { status: 500 });
    }
}
