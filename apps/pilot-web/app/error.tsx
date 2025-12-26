'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an analytics service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Qualcosa è andato storto</h2>
                    <p className="text-slate-500 text-sm">
                        Si è verificato un errore imprevisto. Il nostro team è stato notificato.
                    </p>
                    {error.digest && (
                        <p className="text-xs font-mono text-slate-400 mt-2">Error ID: {error.digest}</p>
                    )}
                </div>

                <button
                    onClick={reset}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                    <RotateCcw className="w-4 h-4" />
                    Riprova
                </button>
            </div>
        </div>
    );
}
