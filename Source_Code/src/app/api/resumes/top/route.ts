import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Resume from "@/models/Resume";
import { successResponse, handleApiError, errorResponse } from "@/lib/api-utils";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        await connectDB();

        // Fetch top 5 resumes with scores > 70%, sorted by matchScore
        // Popululate the job role title for context
        const topResumes = await Resume.find({
            userId: session.user.email,
            matchScore: { $gte: 70 }
        })
            .sort({ matchScore: -1 })
            .limit(5)
            .populate('jobRoleId', 'roleTitle');

        return successResponse({ topResumes });
    } catch (error: any) {
        return handleApiError(error);
    }
}
