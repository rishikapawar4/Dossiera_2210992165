import Link from "next/link";
import JobRoleForm from "@/components/JobRoleForm";

export default function CreateJobRolePage() {
    return (
        <div className="max-w-2xl mx-auto py-8 animate-fade-in">
            <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 text-sm mb-6 inline-flex items-center">
                ← Back to Dashboard
            </Link>

            <JobRoleForm />
        </div>
    );
}
