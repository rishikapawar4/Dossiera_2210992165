import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Resume from "@/models/Resume";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ resumeId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { resumeId } = await params;
        await connectDB();

        // Delete the resume by ID, ensuring the logged in user actually owns it
        const deletedResume = await Resume.findOneAndDelete({
            _id: resumeId,
            userId: session.user.email
        });

        if (!deletedResume) {
            return NextResponse.json({ error: "Resume not found or unauthorized to delete" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Resume deleted successfully" });
    } catch (error: any) {
        console.error("Delete Resume Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete resume" }, { status: 500 });
    }
}
