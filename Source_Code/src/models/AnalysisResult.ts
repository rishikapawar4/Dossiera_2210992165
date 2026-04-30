import mongoose, { Schema, Document, models, Types } from "mongoose";

export interface IAnalysisResult extends Document {
    resumeId: Types.ObjectId;
    userId: Types.ObjectId;
    jobDescription: string;
    skillMatchScore: number;
    atsScore: number;
    missingSkills: string[];
    matchedSkills: string[];
    summary: string;
    improvements: string[];
    careerSuggestions: string[];
    rawAiResponse: string;
    createdAt: Date;
}

const AnalysisResultSchema = new Schema<IAnalysisResult>(
    {
        resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        jobDescription: { type: String, required: true },
        skillMatchScore: { type: Number, default: 0 },
        atsScore: { type: Number, default: 0 },
        missingSkills: [String],
        matchedSkills: [String],
        summary: { type: String },
        improvements: [String],
        careerSuggestions: [String],
        rawAiResponse: { type: String },
    },
    { timestamps: true }
);

const AnalysisResult =
    models.AnalysisResult ||
    mongoose.model<IAnalysisResult>("AnalysisResult", AnalysisResultSchema);

export default AnalysisResult;
