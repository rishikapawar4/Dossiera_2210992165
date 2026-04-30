import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">{children}</main>
            <Footer />
        </div>
    );
}
