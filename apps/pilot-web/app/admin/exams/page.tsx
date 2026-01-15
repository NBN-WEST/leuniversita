'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, GraduationCap, MoreVertical, Loader2 } from 'lucide-react';
import { Exam } from '@/types/supabase';

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await fetch('/api/admin/exams');
                if (res.ok) {
                    const json = await res.json();
                    setExams(json.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch exams', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Esami</h1>
                    <p className="text-slate-500">Gestisci i corsi di laurea/esami disponibili</p>
                </div>
                <Link
                    href="/admin/exams/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuovo Esame
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Titolo</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Stato</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                        Caricamento...
                                    </div>
                                </td>
                            </tr>
                        ) : exams.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    Nessun esame trovato. Creane uno!
                                </td>
                            </tr>
                        ) : (
                            exams.map((exam) => (
                                <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <GraduationCap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-900 block">{exam.title}</span>
                                                {exam.description && (
                                                    <span className="text-xs text-slate-400 truncate max-w-[240px] block">{exam.description}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{exam.id}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                exam.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                            }`}
                                        >
                                            {exam.is_active ? 'Attivo' : 'Disattivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/exams/${exam.id}`}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
