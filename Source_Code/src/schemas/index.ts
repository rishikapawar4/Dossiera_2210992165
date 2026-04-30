import { z } from "zod";

export const jobRoleSchema = z.object({
    roleTitle: z.string().min(2, "Role title must be at least 2 characters"),
    jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
    requiredSkills: z.array(z.string()).default([]),
    experienceLevel: z.string().min(1, "Experience level is required"),
});

export const resumeUploadSchema = z.object({
    jobRoleId: z.string().min(1, "Job Role ID is required"),
});

export type JobRoleInput = z.infer<typeof jobRoleSchema>;
