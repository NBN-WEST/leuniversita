'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Layers, MoreVertical, Loader2 } from 'lucide-react';
import { Course, Module } from '@/types/supabase';

export default function ModulesPage() {
    const [modules, setModules] = useState<Module[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState<string>('all');

    const fetchCourses = async () => {
        const res = await fetch('/api/admin/courses');
        if (res.ok) {
            const json = await res.json();
            setCourses(json.data || []);
        }
    };

    const fetchModules = async (courseId?: string) => {
        const query = courseId && courseId !== 'all' ? `?courseId=${encodeURIComponent(courseId)}` : '';
        const res = await fetch(`/api/admin/modules${query}`);
        if (res.ok) {
            const json = await res.json();
            setModules(json.data || []);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                await fetchCourses();
                await fetchModules();
            } catch (err) {
                console.error('Failed to fetch modules', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        fetchModules(courseFilter);
    }, [courseFilter]);

    const courseMap = new Map(courses.map((c) => [c.id, c]));

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Moduli</h1>
                    <p className="text-slate-500">Gestisci i moduli per corso</p>
                </div>
                <Link
                    href="/admin/modules/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuovo Modulo
                </Link>
            </div>

            <div className="mb-6 max-w-xs">
                <label className="block text-sm font-medium text-slate-700 mb-2">Filtro corso</label>
                <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tutti i corsi</option>
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
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Titolo</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Corso</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Slug</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Ordine</th>
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
                        ) : modules.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    Nessun modulo trovato. Creane uno!
                                </td>
                            </tr>
                        ) : (
                            modules.map((mod) => (
                                <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-slate-900">{mod.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {courseMap.get(mod.course_id)?.title || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{mod.slug}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{mod.order_index}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/modules/${mod.id}`}
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
