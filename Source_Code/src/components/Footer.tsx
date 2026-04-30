export default function Footer() {
    return (
        <footer className="w-full py-6 mt-auto">
            <div className="flex justify-center items-center">
                <p className="text-xs text-slate-500 flex items-center gap-1.5 opacity-60">
                    <span>&copy; 2026 Dossiera</span>
                    <span className="mx-1">•</span>
                    <span>Created with</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-slate-400"
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </p>
            </div>
        </footer>
    );
}
