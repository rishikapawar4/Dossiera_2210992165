"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface JobRole {
    _id: string;
    roleTitle: string;
    experienceLevel: string;
    requiredSkills: string[];
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        /**
         * Fetches all job roles for the current user.
         * The backend service filters roles based on the active session.
         */
        const fetchJobRoles = async () => {
            try {
                const response = await fetch("/api/job-roles");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch job roles");
                }

                setJobRoles(data.jobRoles);
            } catch (error: any) {
                console.error("[Dashboard] Fetch error:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobRoles();
    }, []);

    /**
     * Handles the deletion of a job role.
     * @param event - React mouse event to prevent bubbling
     * @param jobRoleId - The unique identifier of the role to delete
     */
    const handleDeleteJobRole = async (event: React.MouseEvent, jobRoleId: string) => {
        // Prevent clicking the delete button from triggering the card's navigation
        event.preventDefault();
        event.stopPropagation();

        if (!confirm("Are you sure you want to delete this job role and all associated candidate data?")) {
            return;
        }

        try {
            const response = await fetch(`/api/job-roles/${jobRoleId}`, { method: "DELETE" });

            if (!response.ok) {
                throw new Error("Failed to delete job role");
            }

            // Optimistically update the UI by removing the deleted role
            setJobRoles(previousJobRoles =>
                previousJobRoles.filter(role => role._id !== jobRoleId)
            );
        } catch (error: any) {
            console.error("[Dashboard] Delete error:", error);
            alert(error.message);
        }
    };

    return (
        <div className="animate-fade-in text-slate-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">
                        Welcome, {session?.user?.name?.split(" ")[0] || 'Recruiter'} 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage your open roles and analyze incoming resumes.
                    </p>
                </div>
                <Link href="/job-roles/new" className="btn-primary shrink-0">
                    + Create Job Role
                </Link>
            </div>

            {/* Error state */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <span className="text-red-400 text-lg">⚠️</span>
                    <div>
                        <p className="text-red-400 font-bold mb-1">Could not load dashboard</p>
                        <p className="text-red-400/80 text-sm whitespace-pre-line">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {loading && !error && (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}


            {/* Job Roles Grid */}
            {!loading && !error && jobRoles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {jobRoles.map((role) => (
                        <div key={role._id} className="card p-6 flex flex-col group transition-all hover:border-brand-500/40 hover:-translate-y-1 relative">
                            {/* Edit Button */}
                            <Link
                                href={`/job-roles/${role._id}/edit`}
                                className="absolute top-4 right-14 p-2 text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Edit Job Role"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                            </Link>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDeleteJobRole(e, role._id)}
                                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Job Role"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>

                            <div className="mb-4 flex-1">
                                <span className="inline-block px-3 py-1 bg-dark-700 text-slate-300 text-xs font-semibold rounded-full mb-3 border border-dark-600 tracking-wide uppercase">
                                    {role.experienceLevel}
                                </span>
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2" title={role.roleTitle}>
                                    {role.roleTitle}
                                </h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    Created {new Date(role.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {role.requiredSkills.slice(0, 3).map((skill) => (
                                        <span key={skill} className="px-2 py-0.5 bg-brand-500/10 text-brand-400 text-xs rounded border border-brand-500/20">
                                            {skill}
                                        </span>
                                    ))}
                                    {role.requiredSkills.length > 3 && (
                                        <span className="px-2 py-0.5 bg-dark-700 text-slate-400 text-xs rounded border border-dark-600">
                                            +{role.requiredSkills.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-dark-600 flex gap-3">
                                <Link
                                    href={`/job-roles/${role._id}/candidates`}
                                    className="flex-1 btn-primary py-2 text-center text-sm bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20 rounded-lg font-bold"
                                >
                                    View Candidates & Analysis
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && jobRoles.length === 0 && (
                <div className="card p-10 text-center border-dashed border-2 border-dark-600">
                    <span className="text-5xl mb-4 block">👔</span>
                    <h2 className="text-white font-bold text-xl mb-2">
                        No job roles yet
                    </h2>
                    <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                        Create your first job role profile so you can start evaluating and scoring candidate resumes against it.
                    </p>
                    <Link href="/job-roles/new" className="btn-primary inline-block">
                        Create First Role
                    </Link>
                </div>
            )}
        </div>
    );
}
