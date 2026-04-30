"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface AnalysisResult {
    skillMatchScore: number;
    atsScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    summary: string;
}

export default function AnalysisPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { status } = useSession();

    const [jobDescription, setJobDescription] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState("");

    if (status === "loading") return null;

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) {
            setError("Please paste a job description.");
            return;
        }

        setAnalyzing(true);
        setError("");

        try {
            const res = await fetch(`/api/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeId: id, jobDescription }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Analysis failed");

            setResult(data.analysis);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-700"
                >
                    ← Back
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-white">AI Analysis</h1>
                    <p className="text-slate-400 mt-1">Match this resume against a job description.</p>
                </div>
            </div>

            {/* Input Section */}
            {!result && (
                <div className="card p-6 md:p-8">
                    <label className="block text-white font-semibold mb-2">
                        Paste Job Description Here
                    </label>
                    <p className="text-sm text-slate-400 mb-4">
                        The AI will extract key skills from this JD and compare them to the uploaded resume.
                    </p>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="input min-h-[200px] resize-y mb-6 font-mono text-sm leading-relaxed"
                        placeholder="e.g. We are looking for a Senior Frontend Engineer with 5+ years of experience in React, TypeScript, and TailwindCSS..."
                    />

                    {error && <p className="text-red-400 text-sm mb-4">⚠️ {error}</p>}

                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing || !jobDescription.trim()}
                        className="w-full btn-primary py-3 text-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {analyzing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing with Gemini AI...
                            </>
                        ) : (
                            <>Analyze Match ✨</>
                        )}
                    </button>
                </div>
            )}

            {/* Results Section */}
            {result && (
                <div className="space-y-6 animate-slide-up">
                    {/* Top Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card p-6 flex flex-col items-center justify-center text-center">
                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">
                                Skill Match Score
                            </p>
                            <div
                                className={`text-5xl font-extrabold ${result.skillMatchScore >= 80
                                    ? "text-emerald-400"
                                    : result.skillMatchScore >= 60
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                    }`}
                            >
                                {result.skillMatchScore}%
                            </div>
                        </div>
                        <div className="card p-6 flex flex-col items-center justify-center text-center">
                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">
                                ATS Compatibility
                            </p>
                            <div className="text-5xl font-extrabold text-brand-400">
                                {result.atsScore}%
                            </div>
                        </div>
                    </div>

                    {/* AI Summary */}
                    <div className="card p-6 md:p-8">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            📝 Executive Summary
                        </h2>
                        <div className="prose prose-invert max-w-none text-slate-300">
                            <ReactMarkdown>{result.summary}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Skills Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card p-6">
                            <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                ✅ Matched Skills
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {result.matchedSkills.length > 0 ? (
                                    result.matchedSkills.map((s) => (
                                        <span
                                            key={s}
                                            className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm"
                                        >
                                            {s}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm">No exact matches found.</p>
                                )}
                            </div>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                ❌ Missing Skills
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {result.missingSkills.length > 0 ? (
                                    result.missingSkills.map((s) => (
                                        <span
                                            key={s}
                                            className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-sm"
                                        >
                                            {s}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm">No missing skills detected!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            // Re-test with another JD
                            onClick={() => {
                                setResult(null);
                                setJobDescription("");
                            }}
                            className="border border-slate-600 hover:border-slate-400 text-slate-300 font-semibold py-2.5 px-6 rounded-xl transition-all duration-200"
                        >
                            Try Another Job
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="btn-primary"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
