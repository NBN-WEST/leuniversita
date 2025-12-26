'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <h1 className="text-9xl font-bold text-slate-200">404</h1>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Pagina non trovata</h2>
                    <p className="text-slate-500">
                        Ci dispiace, la pagina che stai cercando sembra non esistere o è stata spostata.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Torna alla Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Torna Indietro
                    </button>
                </div>
            </div>
        </div>
    );
}
