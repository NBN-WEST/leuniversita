import Link from 'next/link';
import { Home, BookOpen, Upload, LogOut, GraduationCap, Layers, Route } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold tracking-tight">Le Università <span className="text-blue-400">Admin</span></h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                        <Home className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/admin/courses"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span>Corsi & Moduli</span>
                    </Link>

                    <Link
                        href="/admin/exams"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                        <GraduationCap className="w-5 h-5" />
                        <span>Esami</span>
                    </Link>

                    <Link
                        href="/admin/modules"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                        <Layers className="w-5 h-5" />
                        <span>Moduli</span>
                    </Link>

                    <Link
                        href="/admin/learning-paths"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                        <Route className="w-5 h-5" />
                        <span>Learning Path</span>
                    </Link>

                    <Link
                        href="/admin/ingestion"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Ingestion Sources</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Torna al Sito</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
