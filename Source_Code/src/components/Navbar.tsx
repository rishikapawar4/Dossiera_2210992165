"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
];


export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initial check for 'session.user.name'
    const initial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="border-b border-dark-700 bg-dark-800/60 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="text-xl font-extrabold text-white tracking-tight">
                    Dossiera<span className="text-brand-500">.</span>
                </Link>

                {/* Links */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${pathname === link.href
                                ? "bg-brand-600/20 text-brand-400"
                                : "text-slate-400 hover:text-white hover:bg-dark-700"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User Dropdown */}
                {session?.user && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/10 ring-2 ring-transparent hover:ring-brand-500/30 transition-all">
                                {initial}
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl bg-dark-800/95 border border-dark-700 p-2 shadow-2xl backdrop-blur-xl animate-fade-in animate-slide-up">
                                <div className="px-4 py-3 border-b border-dark-700 mb-2">
                                    <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
                                    >
                                        <div className="p-1.5 rounded-lg bg-dark-700 group-hover:bg-red-500/20 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </div>
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>

    );
}
