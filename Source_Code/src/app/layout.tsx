import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Dossiera – AI Resume Analyzer",
    description: "Evaluate resumes against job descriptions with AI-powered insights.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-dark-900 text-slate-100 antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
