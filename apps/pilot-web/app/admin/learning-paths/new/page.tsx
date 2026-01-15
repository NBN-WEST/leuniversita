'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Course, Module } from '@/types/supabase';

export default function NewLearningPathItemPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseParam = searchParams.get('courseId') || '';

    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        course_id: courseParam,
        module_id: '',
        type: 'core',
        order_index: 0,
        status: 'active'
    });

    useEffect(() => {
        const fetchCourses = async () => {
            const res = await fetch('/api/admin/courses');
            if (res.ok) {
                const json = await res.json();
                setCourses(json.data || []);
                if (!form.course_id && json.data?.[0]?.id) {
                    setForm((prev) => ({ ...prev, course_id: json.data[0].id }));
                }
            }
        };
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const fetchModules = async () => {
            if (!form.course_id) return;
            const res = await fetch(`/api/admin/modules?courseId=${encodeURIComponent(form.course_id)}`);
            if (res.ok) {
                const json = await res.json();
                setModules(json.data || []);
            }
        };
        fetchModules();
    }, [form.course_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/learning-paths/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    order_index: Number(form.order_index)
                })
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Errore durante la creazione della voce');
            }

            router.push('/admin/learning-paths');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="mb-8">
                <Link href="/admin/learning-paths" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla lista
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Aggiungi Modulo al Learning Path</h1>
                <p className="text-slate-500">Seleziona corso e modulo da associare.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Corso <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={form.course_id}
                        onChange={(e) => setForm({ ...form, course_id: e.target.value, module_id: '' })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Modulo <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={form.module_id}
                        onChange={(e) => setForm({ ...form, module_id: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleziona un modulo</option>
                        {modules.map((mod) => (
                            <option key={mod.id} value={mod.id}>
                                {mod.title} ({mod.slug})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tipo
                        </label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="core">Core</option>
                            <option value="reinforcement">Rinforzo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Ordine
                        </label>
                        <input
                            type="number"
                            value={form.order_index}
                            onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Stato
                    </label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="active">Attivo</option>
                        <option value="archived">Archiviato</option>
                    </select>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salva
                    </button>
                </div>
            </form>
        </div>
    );
}
