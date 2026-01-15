'use client';

import { Plus, BookOpen, MoreVertical, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Course } from '@/types/supabase';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/admin/courses');
                if (res.ok) {
                    const json = await res.json();
                    setCourses(json.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch courses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Corsi & Moduli</h1>
                    <p className="text-slate-500">Gestisci l'offerta formativa</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/courses/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4" />
                        Crea Corso
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cerca corso..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Titolo</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">ID (Slug)</th>
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
                        ) : courses.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    Nessun corso trovato. Crea il primo!
                                </td>
                            </tr>
                        ) : (
                            courses.map((course) => {
                                const status = course.status || 'draft';
                                return (
                                <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-900 block">{course.title}</span>
                                                {course.description && <span className="text-xs text-slate-400 truncate max-w-[200px] block">{course.description}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{course.slug}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                status === 'published'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : status === 'archived'
                                                        ? 'bg-slate-200 text-slate-600'
                                                        : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {status === 'published'
                                                ? 'Pubblicato'
                                                : status === 'archived'
                                                    ? 'Archiviato'
                                                    : 'Bozza'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/courses/${course.id}`}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
