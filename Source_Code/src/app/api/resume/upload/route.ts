import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import pdfParse from "pdf-parse";
import { connectDB } from "@/lib/db";
import Resume from "@/models/Resume";
import JobRole from "@/models/JobRole";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const files = formData.getAll("resume") as File[];
        const jobRoleId = formData.get("jobRoleId") as string | null;

        if (!files.length || !jobRoleId) {
            return NextResponse.json({ error: "At least one file and jobRoleId are required" }, { status: 400 });
        }

        console.log(`[Upload API] Received request with ${files.length} files for jobRole ${jobRoleId}`);

        await connectDB();

        // Fetch the job role to compare against
        const jobRole = await JobRole.findById(jobRoleId);
        if (!jobRole) {
            return NextResponse.json({ error: "Job role not found" }, { status: 404 });
        }

        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        const newResumes = [];

        // Process each file sequentially
        for (const file of files) {
            if (file.type !== "application/pdf") {
                console.warn(`[Upload] Skipping non-PDF file: ${file.name}`);
                continue;
            }

            if (file.size > MAX_SIZE) {
                console.warn(`[Upload] Skipping file exceeding size limit: ${file.name}`);
                continue;
            }

            // Convert File object to Buffer for file system and parsing operations
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uniqueId = randomUUID();
            const uniqueName = `${uniqueId}.pdf`;
            const filePath = path.join(uploadsDir, uniqueName);
            await writeFile(filePath, buffer);

            let extractedText = "";
            try {
                const pdfData = await pdfParse(buffer);
                extractedText = pdfData.text;
            } catch (parsingError) {
                console.warn(`[Upload] Failed to parse PDF text for ${file.name}:`, parsingError);
            }

            /** 
             * LOCAL PARSING ENGINE
             * --------------------
             * We use a heuristic-based extraction system instead of raw AI to ensure 
             * high performance, zero cost, and reliability for candidate matching.
             */
            let candidateName = "Unknown Candidate";
            let candidateEmail = "";
            let extractedSkills: string[] = [];
            let yearsOfExperience = 0;
            let matchScore = 0;
            let matchedSkills: string[] = [];
            let missingSkills = [...jobRole.requiredSkills];

            if (extractedText) {
                const textLines = extractedText.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);

                // Step 1: Extract Email (Regex matching)
                const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
                const emailMatch = extractedText.match(emailRegex);
                if (emailMatch) {
                    candidateEmail = emailMatch[0];
                }

                // Step 2: Extract Candidate Name 
                // Heuristic: Analyze the first 10 lines of the resume
                for (const line of textLines.slice(0, 10)) {
                    // Skip lines with emails, symbols, or invalid lengths
                    if (line.includes('@') || line.includes('/') || line.length < 3 || line.length > 50) continue;

                    // Skip common resume header keywords
                    if (/resume|curriculum|cv|contact|address/i.test(line)) continue;

                    candidateName = line;
                    break;
                }

                // Step 3: Extract Years of Experience (Pattern recognition)
                const experienceRegex = /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/gi;
                const experienceMatch = experienceRegex.exec(extractedText);
                if (experienceMatch) {
                    yearsOfExperience = parseInt(experienceMatch[1]);
                }

                // Step 4: Skill Matching Analysis
                // Cross-reference resume text against the Job Role's required skills
                const foundSkills = jobRole.requiredSkills.filter((skill: string) => {
                    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const skillRegex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
                    return skillRegex.test(extractedText);
                });

                matchedSkills = foundSkills;
                missingSkills = jobRole.requiredSkills.filter((skill: string) => !matchedSkills.includes(skill));

                // Step 5: General Technology Extraction
                const commonTechnologies = ['javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql', 'aws', 'docker', 'css', 'html', 'git', 'mongodb'];
                extractedSkills = commonTechnologies.filter(technology => {
                    const regex = new RegExp(`\\b${technology}\\b`, 'i');
                    return regex.test(extractedText);
                });

                // Step 6: Final Match Score Calculation
                if (jobRole.requiredSkills.length > 0) {
                    const matchedCount = matchedSkills.length;
                    const totalRequiredCount = jobRole.requiredSkills.length;
                    matchScore = Math.round((matchedCount / totalRequiredCount) * 100);
                }
            }

            // Persist the analyzed results to the database
            const newResume = await Resume.create({
                userId: session.user.email,
                jobRoleId: jobRole._id,
                originalName: file.name,
                storedName: uniqueName,
                fileUrl: `/uploads/${uniqueName}`,
                fileSize: file.size,
                extractedText,
                candidateName,
                candidateEmail,
                extractedSkills,
                yearsOfExperience,
                matchScore,
                matchedSkills,
                missingSkills,
                status: "analyzed",
            });

            newResumes.push(newResume);
        }

        return NextResponse.json({
            success: true,
            resumes: newResumes,
        });
    } catch (error: any) {
        // Fallback to centralized error handler for consistent API responses
        const { handleApiError } = require("@/lib/api-utils");
        return handleApiError(error);
    }
}
