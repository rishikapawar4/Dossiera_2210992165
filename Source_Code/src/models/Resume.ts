import mongoose, { Schema, Document, models, Types } from "mongoose";

export interface IResume extends Document {
    userId: string;
    originalName: string;
    storedName: string;
    fileUrl: string;
    fileSize: number;
    extractedText?: string;

    // Candidate & Job fields
    candidateName?: string;
    candidateEmail?: string;
    resumeFile?: string; // Storing URL or reference again if needed natively
    extractedSkills: string[];
    yearsOfExperience?: number;
    jobRoleId?: string;

    // Ranking fields
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];

    status: "uploaded" | "parsed" | "analyzed";
    createdAt: Date;
    updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
    {
        userId: { type: String, required: true },
        originalName: { type: String, required: true },
        storedName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, required: true },
        extractedText: { type: String },

        candidateName: { type: String },
        candidateEmail: { type: String },
        resumeFile: { type: String },
        extractedSkills: { type: [String], default: [] },
        yearsOfExperience: { type: Number },
        jobRoleId: { type: Schema.Types.ObjectId, ref: "JobRole" }, // Links to JobRole

        matchScore: { type: Number, default: 0 },
        matchedSkills: { type: [String], default: [] },
        missingSkills: { type: [String], default: [] },

        status: {
            type: String,
            enum: ["uploaded", "parsed", "analyzed"],
            default: "uploaded",
        },
    },
    { timestamps: true }
);

const Resume = models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);
export default Resume;
