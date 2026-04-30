import Link from "next/link";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LandingPage() {
    const session = await getServerSession(authOptions);
    const startHref = session ? "/dashboard" : "/login";

    return (
        <main className="min-h-screen bg-dark-900 flex flex-col">
            {/* Nav */}
            <nav className="border-b border-dark-700 bg-dark-800/60 backdrop-blur-md sticky top-0 z-50 w-full">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link href="/" className="text-xl font-extrabold text-white tracking-tight">
                        Dossiera<span className="text-brand-500">.</span>
                    </Link>
                    <Link
                        href={startHref}
                        className="btn-primary text-sm"
                    >
                        Get Started →
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in">
                <span className="inline-block bg-brand-600/15 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-brand-500/30 mb-6 uppercase tracking-widest">
                    AI-Powered Resume Intelligence
                </span>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                    Hire Smarter<br />
                    <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Analyze Faster
                    </span>
                </h1>

                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                    Dossiera uses AI to evaluate resumes against job descriptions — scoring
                    skill match, requirements coverage, and generating actionable insights in seconds.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={startHref} className="btn-primary text-base px-8 py-3">
                        Start Analyzing Resumes
                    </Link>
                    <a
                        href="#how-it-works"
                        className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200"
                    >
                        See How It Works
                    </a>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="grid md:grid-cols-3 gap-6 px-8 py-20 max-w-6xl mx-auto w-full">
                {[
                    {
                        icon: "🎯",
                        title: "Skill Match Score",
                        desc: "Instantly compare resume skills against job requirements with a precise match score.",
                    },
                    {
                        icon: "🤖",
                        title: "AI Insights",
                        desc: "Get Gemini-powered resume summaries, improvements, and career suggestions.",
                    },
                    {
                        icon: "📊",
                        title: "Smart Compatibility",
                        desc: "Know exactly how well a resume will perform against modern hiring standards.",
                    },
                ].map((f) => (
                    <div key={f.title} className="card p-6 hover:border-brand-600/50 transition-all duration-300">
                        <span className="text-3xl">{f.icon}</span>
                        <h3 className="text-white font-bold text-lg mt-3 mb-2">{f.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="-mt-10 py-32 px-8 bg-dark-800/30 border-y border-dark-700/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">How it Works</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Three simple steps to transform your recruitment process.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Create Job Role", desc: "Define the position, experience levels, and specific keywords you're looking for." },
                            { step: "02", title: "Upload Resumes", desc: "Bulk upload candidate resumes. Our engine handles the parsing and extraction instantly." },
                            { step: "03", title: "Analyze & Select", desc: "Review AI-generated match scores and detailed insights to find your perfect fit." }
                        ].map((s) => (
                            <div key={s.step} className="relative group">
                                <div className="text-8xl font-black text-brand-500/5 absolute -top-8 -left-4 group-hover:text-brand-500/10 transition-colors pointer-events-none">
                                    {s.step}
                                </div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-brand-600/10 rounded-lg flex items-center justify-center text-brand-400 font-bold mb-4 border border-brand-500/20">
                                        {s.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
