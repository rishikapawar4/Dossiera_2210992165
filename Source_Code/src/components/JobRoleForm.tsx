"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface JobRoleData {
    _id?: string;
    roleTitle: string;
    jobDescription: string;
    requiredSkills: string[];
    experienceLevel: string;
}

interface JobRoleFormProps {
    initialData?: JobRoleData;
    isEdit?: boolean;
}

export default function JobRoleForm({ initialData, isEdit = false }: JobRoleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [roleTitle, setRoleTitle] = useState(initialData?.roleTitle || "");
    const [jobDescription, setJobDescription] = useState(initialData?.jobDescription || "");
    const [skillsString, setSkillsString] = useState(initialData?.requiredSkills?.join(", ") || "");
    const [experienceLevel, setExperienceLevel] = useState(initialData?.experienceLevel || "Mid-Level");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const requiredSkills = skillsString.split(",").map(s => s.trim()).filter(Boolean);

        try {
            const url = isEdit ? `/api/job-roles/${initialData?._id}` : "/api/job-roles";
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleTitle,
                    jobDescription,
                    requiredSkills,
                    experienceLevel,
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message || `Failed to ${isEdit ? "update" : "create"} job role`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 sm:p-8 shadow-2xl mt-4">
            <h1 className="text-2xl font-bold text-white mb-2">
                {isEdit ? "Edit Job Role" : "Create New Job Role"}
            </h1>
            <p className="text-slate-400 text-sm mb-6">
                {isEdit
                    ? "Update the role details and required skills to refine your screening criteria."
                    : "Define the role details and required skills to start standardizing candidate screening."}
            </p>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Role Title</label>
                    <input
                        type="text"
                        required
                        value={roleTitle}
                        onChange={(e) => setRoleTitle(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                        placeholder="e.g., Senior Frontend Engineer"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Description</label>
                    <textarea
                        required
                        rows={4}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors resize-none"
                        placeholder="Brief description of the responsibilities and team..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Required Skills (Comma separated)</label>
                    <input
                        type="text"
                        required
                        value={skillsString}
                        onChange={(e) => setSkillsString(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                        placeholder="e.g., React, TypeScript, Node.js, AWS"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Experience Level</label>
                    <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                    >
                        <option value="Entry-Level">Entry-Level (0-2 years)</option>
                        <option value="Mid-Level">Mid-Level (3-5 years)</option>
                        <option value="Senior">Senior (5+ years)</option>
                        <option value="Executive">Executive / Director</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 disabled:opacity-50"
                    >
                        {loading ? (isEdit ? "Saving..." : "Creating Role...") : (isEdit ? "Save" : "Create Job Role")}
                    </button>
                </div>
            </form>
        </div>
    );
}
