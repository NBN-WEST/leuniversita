'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Route, Loader2 } from 'lucide-react';
import { Course, LearningPathItem } from '@/types/supabase';

export default function LearningPathsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [courseId, setCourseId] = useState<string>('');
    const [items, setItems] = useState<LearningPathItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        const res = await fetch('/api/admin/courses');
        if (res.ok) {
            const json = await res.json();
            setCourses(json.data || []);
            if (!courseId && json.data?.[0]?.id) {
                setCourseId(json.data[0].id);
            }
        }
    };

    const fetchItems = async (course: string) => {
        if (!course) return;
        const res = await fetch(`/api/admin/learning-paths/items?courseId=${encodeURIComponent(course)}`);
        if (res.ok) {
            const json = await res.json();
            setItems(json.data || []);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchCourses();
            setLoading(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!courseId) return;
        fetchItems(courseId);
    }, [courseId]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Learning Path</h1>
                    <p className="text-slate-500">Associa moduli e definisci l’ordine del percorso.</p>
                </div>
                <Link
                    href={`/admin/learning-paths/new${courseId ? `?courseId=${courseId}` : ''}`}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Aggiungi Modulo
                </Link>
            </div>

            <div className="mb-6 max-w-xs">
                <label className="block text-sm font-medium text-slate-700 mb-2">Corso</label>
                <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.title}
                        </option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Modulo</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Tipo</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Ordine</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Stato</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                        Caricamento...
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    Nessun modulo associato. Aggiungine uno.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Route className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-900 block">{item.modules?.title || '—'}</span>
                                                <span className="text-xs text-slate-400">{item.modules?.slug}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {item.type === 'reinforcement' ? 'Rinforzo' : 'Core'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{item.order_index}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {item.status === 'archived' ? 'Archiviato' : 'Attivo'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/learning-paths/${item.id}`}
                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            Modifica
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
