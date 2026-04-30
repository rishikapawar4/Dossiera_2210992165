"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import JobRoleForm from "@/components/JobRoleForm";

export default function EditJobRolePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [jobRole, setJobRole] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobRole = async () => {
            try {
                const res = await fetch(`/api/job-roles/${id}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Failed to fetch job role");

                setJobRole(data.jobRole);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchJobRole();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !jobRole) {
        return (
            <div className="max-w-2xl mx-auto py-8">
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error || "Job role not found"}
                </div>
                <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 text-sm">
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 animate-fade-in">
            <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 text-sm mb-6 inline-flex items-center">
                ← Back to Dashboard
            </Link>

            <JobRoleForm initialData={jobRole} isEdit={true} />
        </div>
    );
}
