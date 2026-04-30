import mongoose, { Schema, Document, models } from "mongoose";

export interface IJobRole extends Document {
    userId: string;           // email — used as identifier in JWT-only session mode
    roleTitle: string;
    jobDescription: string;
    requiredSkills: string[];
    experienceLevel: string;
    createdAt: Date;
}

const JobRoleSchema = new Schema<IJobRole>(
    {
        userId: { type: String, required: true },   // stores user's email
        roleTitle: { type: String, required: true },
        jobDescription: { type: String, required: true },
        requiredSkills: { type: [String], default: [] },
        experienceLevel: { type: String, required: true },
    },
    { timestamps: true }
);

const JobRole = models.JobRole || mongoose.model<IJobRole>("JobRole", JobRoleSchema);
export default JobRole;
