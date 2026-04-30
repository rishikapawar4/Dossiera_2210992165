import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    image?: string;
    role: "recruiter" | "candidate";
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        image: { type: String },
        role: { type: String, enum: ["recruiter", "candidate"], default: "recruiter" },
    },
    { timestamps: true }
);

const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
