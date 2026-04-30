"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // If already logged in, send to dashboard
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
            <div className="w-full max-w-sm animate-slide-up">
                {/* Card */}
                <div className="card p-8 text-center">
                    {/* Logo */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Dossiera<span className="text-brand-500">.</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">AI Resume Analyzer</p>
                    </div>

                    <p className="text-slate-300 font-medium mb-6">
                        Sign in to your recruiter account
                    </p>

                    {/* Google Button */}
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="flex items-center justify-center gap-3 w-full bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-white/10"
                    >
                        {/* Google SVG */}
                        <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.4 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6C12.7 13.1 17.9 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 6.9-10.1 7.1-17z" />
                            <path fill="#FBBC05" d="M10.8 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.6 2.5 10.9l8.3-6.2z" />
                            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.3-3.6-13.2-9.2l-8.3 6.2C6.9 42.6 14.8 48 24 48z" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-slate-600 text-xs mt-6">
                        By signing in, you agree to our terms of service.
                    </p>
                </div>

                {/* Back link */}
                <p className="text-center mt-4 text-slate-500 text-sm">
                    <a href="/" className="hover:text-brand-400 transition-colors">← Back to homepage</a>
                </p>
            </div>
        </div>
    );
}
