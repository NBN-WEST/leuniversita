"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CookieBannerProps {
    onAccept: () => void;
    onReject: () => void;
}

export default function CookieBanner({ onAccept, onReject }: CookieBannerProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay for smooth entrance animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-500 ease-in-out ${isVisible ? "translate-y-0" : "translate-y-full"
                }`}
        >
            <div className="max-w-7xl mx-auto bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 md:flex md:items-center md:justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        La tua privacy è importante
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Utilizziamo i cookie per migliorare la tua esperienza di navigazione, offrirti contenuti personalizzati e analizzare il nostro traffico.
                        Cliccando su "Accetta tutto", acconsenti al nostro utilizzo dei cookie in conformità con la nostra
                        <Link href="/cookie-policy" className="text-blue-600 hover:text-blue-500 underline decoration-blue-600/30 hover:decoration-blue-500 mx-1 transition-colors">
                            Cookie Policy
                        </Link>
                        e
                        <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-500 underline decoration-blue-600/30 hover:decoration-blue-500 mx-1 transition-colors">
                            Privacy Policy
                        </Link>.
                    </p>
                </div>

                <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onReject}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-none"
                    >
                        Rifiuta
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        Accetta tutto
                    </button>
                </div>
            </div>
        </div>
    );
}
