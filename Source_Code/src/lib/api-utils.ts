import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function successResponse(data: any, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

export function errorResponse(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(error: any) {
    console.error("[API Error]:", error);

    if (error instanceof ZodError) {
        return errorResponse(error.issues[0].message, 400);
    }

    // Handle mongoose validation errors
    if (error && typeof error === 'object' && error.name === "ValidationError") {
        const mongooseError = error as any;
        return errorResponse(Object.values(mongooseError.errors)[0]?.toString() || "Validation Error", 400);
    }

    // Handle unauthorized/forbidden specifically if needed
    if (error instanceof Error && error.message === "Unauthorized") {
        return errorResponse("Unauthorized", 401);
    }

    return errorResponse(error instanceof Error ? error.message : "Internal Server Error", 500);
}
