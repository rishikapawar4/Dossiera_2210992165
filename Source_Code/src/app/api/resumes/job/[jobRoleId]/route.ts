import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Resume from "@/models/Resume";

export async function GET(req: NextRequest, { params }: { params: Promise<{ jobRoleId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobRoleId } = await params;

        await connectDB();

        // Fetch all resumes for this job role, sort by highest matchScore first, then newest
        const resumes = await Resume.find({ jobRoleId })
            .sort({ matchScore: -1, createdAt: -1 });

        return NextResponse.json({ success: true, resumes });
    } catch (error: any) {
        console.error("Get Resumes Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch resumes" }, { status: 500 });
    }
}
