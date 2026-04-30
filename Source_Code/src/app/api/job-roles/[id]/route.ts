import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import JobRole from "@/models/JobRole";
import Resume from "@/models/Resume";
import { jobRoleSchema } from "@/schemas";
import { successResponse, handleApiError, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        const { id } = await params;
        await connectDB();

        const jobRole = await JobRole.findById(id);

        if (!jobRole) {
            return errorResponse("Job role not found", 404);
        }

        if (jobRole.userId !== session.user.email) {
            return errorResponse("Forbidden", 403);
        }

        return successResponse({ jobRole });
    } catch (error: any) {
        return handleApiError(error);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        const { id } = await params;
        await connectDB();

        const jobRole = await JobRole.findById(id);
        if (!jobRole) {
            return errorResponse("Job role not found", 404);
        }

        if (jobRole.userId !== session.user.email) {
            return errorResponse("Forbidden", 403);
        }

        // Delete all associated resumes
        await Resume.deleteMany({ jobRoleId: id });

        // Delete the job role
        await JobRole.findByIdAndDelete(id);

        return successResponse({ message: "Job role and associated resumes deleted successfully" });
    } catch (error: any) {
        return handleApiError(error);
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        const { id } = await params;
        const body = await req.json();
        const validatedData = jobRoleSchema.partial().parse(body); // Use partial for PATCH

        await connectDB();

        const jobRole = await JobRole.findById(id);
        if (!jobRole) {
            return errorResponse("Job role not found", 404);
        }

        if (jobRole.userId !== session.user.email) {
            return errorResponse("Forbidden", 403);
        }

        const updatedJobRole = await JobRole.findByIdAndUpdate(
            id,
            { ...validatedData },
            { new: true }
        );

        return successResponse({ jobRole: updatedJobRole });
    } catch (error: any) {
        return handleApiError(error);
    }
}
