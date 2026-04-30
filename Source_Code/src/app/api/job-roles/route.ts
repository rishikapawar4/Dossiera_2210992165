import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import JobRole from "@/models/JobRole";
import { jobRoleSchema } from "@/schemas";
import { successResponse, handleApiError, errorResponse } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        const body = await req.json();
        const validatedData = jobRoleSchema.parse(body);

        await connectDB();

        const jobRole = await JobRole.create({
            userId: session.user.email,
            ...validatedData,
        });

        return successResponse({ jobRole }, 201);
    } catch (error: any) {
        return handleApiError(error);
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        await connectDB();

        const jobRoles = await JobRole.find({ userId: session.user.email }).sort({ createdAt: -1 });

        return successResponse({ jobRoles });
    } catch (error: any) {
        return handleApiError(error);
    }
}
