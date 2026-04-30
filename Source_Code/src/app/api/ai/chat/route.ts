import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, requiredSkills, messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Valid message history is required." }, { status: 400 });
        }

        if (!genAI) {
            return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // System Instruction / Prompt
        const systemInstruction = `You are a highly capable AI Co-Recruiter assistant.
You are currently helping a recruiting manager hire for the role of: "${title}".
The required skills identified for this role are: ${requiredSkills.join(", ")}.

Your goal is to assist the recruiter with anything they need for this specific role, such as generating interview questions, suggesting assessment criteria, writing job descriptions, providing technical screening tips, etc.

IMPORTANT RULES:
1. Always format your responses in clean, readable Markdown. Use headings, bullet points, and bold text for excellent readability.
2. Directly answer exactly what the user asks. (e.g. If they ask for 5 non-coding questions, give them exactly 5).
3. Do not output raw JSON unless specifically requested by the user. Do not use JSON structures; provide conversational yet professional output.`;

        // Format history for Gemini
        const chatHistory = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'agent' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const latestMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemInstruction }] },
                { role: 'model', parts: [{ text: "Understood. I am ready to act as your AI Co-Recruiter." }] },
                ...chatHistory
            ],
        });

        const result = await chat.sendMessage(latestMessage);
        const responseText = result.response.text();

        return NextResponse.json({
            success: true,
            response: responseText
        });

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
    }
}
