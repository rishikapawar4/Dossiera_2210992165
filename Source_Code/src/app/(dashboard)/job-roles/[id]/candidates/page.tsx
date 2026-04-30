"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface JobRole {
    _id: string;
    roleTitle: string;
    requiredSkills: string[];
    experienceLevel: string;
}

interface Resume {
    _id: string;
    candidateName: string;
    candidateEmail: string;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    createdAt: string;
    fileUrl: string;
}

interface ChatMessage {
    role: 'user' | 'agent';
    content: string;
}

export default function CandidatesPage() {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const roleId = params.id as string;

    const [jobRole, setJobRole] = useState<JobRole | null>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailingId, setEmailingId] = useState<string | null>(null);

    // AI Recruiter Chat States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Job Role and its Resumes on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Job Role Details
                const roleRes = await fetch(`/api/job-roles/${roleId}`);
                if (!roleRes.ok) throw new Error("Job role not found");
                const roleData = await roleRes.json();
                setJobRole(roleData.jobRole);

                // Initialize first AI message
                setChatMessages([
                    { role: 'agent', content: `Hi! I'm your AI Co-Recruiter for the **${roleData.jobRole.roleTitle}** role.\n\nI can help you build the perfect set of interview questions, review candidate screening approaches, or refine technical criteria!` }
                ]);

                // 2. Fetch Candidates/Resumes for this role
                await fetchResumes();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [roleId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatOpen) scrollToBottom();
    }, [chatMessages, isChatOpen]);

    const fetchResumes = async () => {
        const resRes = await fetch(`/api/resumes/job/${roleId}`);
        const resData = await resRes.json();
        if (resRes.ok) {
            setResumes(resData.resumes);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("jobRoleId", roleId);

        Array.from(e.target.files).forEach((file) => {
            formData.append("resume", file);
        });

        try {
            const res = await fetch("/api/resume/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            await fetchResumes();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleDeleteResume = async (resumeId: string, candidateName: string) => {
        if (!window.confirm(`Are you sure you want to delete ${candidateName}'s resume?`)) return;

        try {
            const res = await fetch(`/api/resume/${resumeId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setResumes(prevResumes => prevResumes.filter(r => r._id !== resumeId));
        } catch (err: any) {
            alert(err.message || "Failed to delete resume");
        }
    };

    const handleSendEmail = async (candidateName: string, candidateEmail: string, missingSkills: string[], matchedSkills: string[], action: "reject" | "interview", resumeId: string) => {
        if (!jobRole) return;

        if (!window.confirm(`Are you sure you want to send a ${action} email to ${candidateName}?`)) return;

        setEmailingId(resumeId);

        try {
            const res = await fetch("/api/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobTitle: jobRole.roleTitle,
                    candidateEmail,
                    candidateName,
                    missingSkills,
                    matchedSkills,
                    action
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            alert("✅ " + data.message);
        } catch (err: any) {
            alert("❌ Failed: " + err.message);
        } finally {
            setEmailingId(null);
        }
    };

    const handleSendChatMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim() || !jobRole || chatLoading) return;

        const userMessage = chatInput.trim();
        const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];

        setChatMessages(newMessages);
        setChatInput("");
        setChatLoading(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: jobRole.roleTitle,
                    requiredSkills: jobRole.requiredSkills,
                    messages: newMessages
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setChatMessages([...newMessages, { role: 'agent', content: data.response }]);
        } catch (err: any) {
            setChatMessages([...newMessages, { role: 'agent', content: `**Error:** Failed to connect to AI... ${err.message}` }]);
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (error && !jobRole) {
        return <div className="text-red-400 p-6 bg-red-500/10 rounded-xl">{error}</div>;
    }

    return (
        <div className="animate-fade-in pb-10">
            <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 text-sm mb-6 inline-flex items-center">
                ← Back to Dashboard
            </Link>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">{jobRole?.roleTitle}</h1>
                    <div className="flex flex-wrap gap-2 items-center text-sm text-slate-400 mb-4">
                        <span className="bg-dark-700 px-3 py-1 rounded text-slate-300 border border-dark-600">
                            {jobRole?.experienceLevel}
                        </span>
                        <span>•</span>
                        <span>{resumes.length} Candidates</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <button disabled={uploading} className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : "📄 Upload Candidate Resumes"}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Candidates Listing */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 border-b border-dark-600 pb-3">
                    Candidate Ranking List
                </h2>

                {resumes.length === 0 ? (
                    <div className="card p-12 text-center border-dashed border-2 border-dark-600">
                        <span className="text-4xl mb-3 block opacity-50">📄</span>
                        <h3 className="text-white font-bold text-lg mb-1">No candidates yet</h3>
                        <p className="text-slate-400 text-sm">Upload a resume to automatically score and rank it against this job role.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {resumes.map((resume, index) => (
                            <div key={resume._id} className="bg-dark-800 border border-dark-600 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-6 hover:border-dark-500 transition-colors">

                                {/* Rank & Score */}
                                <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 bg-dark-900/50 rounded-lg p-4 border border-dark-700 md:w-32 shrink-0">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rank #{index + 1}</span>
                                    <div className="flex flex-col items-center">
                                        <span className={`text-3xl font-extrabold ${resume.matchScore >= 80 ? 'text-emerald-400' : resume.matchScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {resume.matchScore}%
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">Match</span>
                                    </div>
                                </div>

                                {/* Candidate Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-white truncate">{resume.candidateName}</h3>
                                            <p className="text-sm text-slate-400 truncate">{resume.candidateEmail || "No email extracted"}</p>
                                        </div>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(resume.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Skills Analysis */}
                                    <div className="mt-4 space-y-3">
                                        {/* Matched */}
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-400/80 mb-1.5 uppercase tracking-wider">✓ Matched Required Skills</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {resume.matchedSkills.length > 0 ? resume.matchedSkills.map(skill => (
                                                    <span key={skill} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">
                                                        {skill}
                                                    </span>
                                                )) : <span className="text-xs text-slate-500 italic">None</span>}
                                            </div>
                                        </div>

                                        {/* Missing */}
                                        {resume.missingSkills.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-red-400/80 mb-1.5 uppercase tracking-wider">✗ Missing Required Skills</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {resume.missingSkills.map(skill => (
                                                        <span key={skill} className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20 opacity-70">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-dark-600 pt-4 md:pt-0 md:pl-6 w-full md:w-36">
                                    <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary bg-dark-700 border border-dark-600 hover:bg-dark-600 text-sm py-2 px-4 shadow-none text-center rounded-lg">
                                        View Resume
                                    </a>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            disabled={emailingId === resume._id}
                                            onClick={() => handleSendEmail(resume.candidateName, resume.candidateEmail, resume.missingSkills, resume.matchedSkills, "reject", resume._id)}
                                            className="btn-primary bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs py-2 px-1 shadow-none text-center rounded-lg disabled:opacity-50"
                                            title="Send Rejection Email"
                                        >
                                            {emailingId === resume._id ? "..." : "🛑 Reject"}
                                        </button>
                                        <button
                                            disabled={emailingId === resume._id}
                                            onClick={() => handleSendEmail(resume.candidateName, resume.candidateEmail, resume.missingSkills, resume.matchedSkills, "interview", resume._id)}
                                            className="btn-primary bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs py-2 px-1 shadow-none text-center rounded-lg disabled:opacity-50"
                                            title="Send Interview Invite"
                                        >
                                            {emailingId === resume._id ? "..." : "✅ Invite"}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteResume(resume._id, resume.candidateName)}
                                        className="text-slate-500 hover:text-red-400 transition-colors mt-3 flex justify-center w-full"
                                        title="Delete Candidate"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating AI Chatbot Window */}
            {isChatOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-dark-800 border border-brand-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-fade-in">
                    {/* Header */}
                    <div className="bg-dark-900 border-b border-dark-600 p-4 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            <div>
                                <h3 className="font-bold text-white text-sm">AI Co-Recruiter</h3>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-br-none' : 'bg-dark-700 text-slate-300 border border-dark-600 rounded-bl-none shadow-sm'}`}>
                                    <div className="[&_p]:mb-4 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1.5 [&_li]:pl-1 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-white [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-white [&_h2]:mt-6 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:text-white [&_h3]:mt-4 [&_strong]:font-bold [&_strong]:text-brand-300">
                                        <ReactMarkdown>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-dark-700 text-slate-200 border border-dark-600 rounded-2xl rounded-bl-none p-3 text-sm flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-dark-900 border-t border-dark-600 p-4 shrink-0">
                        <form onSubmit={handleSendChatMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="E.g., Give me 5 non-coding questions..."
                                className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 min-w-0"
                                disabled={chatLoading}
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || chatLoading}
                                className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl p-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </form>
                    </div>
                </div >
            )
            }

            {/* Floating Toggle Button */}
            {
                !isChatOpen && (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/30 flex items-center justify-center transition-transform hover:scale-105 z-50 animate-fade-in"
                    >
                        <span className="text-2xl">✨</span>
                    </button>
                )
            }
        </div >
    );
}
