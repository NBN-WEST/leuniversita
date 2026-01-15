'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Course } from '@/types/supabase';

export default function EditModulePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const moduleId = resolvedParams.id;

    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        id: '',
        course_id: '',
        title: '',
        slug: '',
        server_id: '',
        order_index: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, moduleRes] = await Promise.all([
                    fetch('/api/admin/courses'),
                    fetch(`/api/admin/modules?id=${moduleId}`)
                ]);

                if (courseRes.ok) {
                    const courseJson = await courseRes.json();
                    setCourses(courseJson.data || []);
                }

                if (!moduleRes.ok) throw new Error('Errore durante il recupero del modulo');
                const moduleJson = await moduleRes.json();
                if (moduleJson.data) {
                    setForm({
                        id: moduleJson.data.id,
                        course_id: moduleJson.data.course_id,
                        title: moduleJson.data.title,
                        slug: moduleJson.data.slug,
                        server_id: moduleJson.data.server_id || '',
                        order_index: moduleJson.data.order_index ?? 0
                    });
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [moduleId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/modules', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    order_index: Number(form.order_index)
                })
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Errore durante l\'aggiornamento del modulo');
            }

            router.push('/admin/modules');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="mb-8">
                <Link href="/admin/modules" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla lista
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Modifica Modulo</h1>
                <p className="text-slate-500">Aggiorna il modulo selezionato.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        ID (immutabile)
                    </label>
                    <input
                        type="text"
                        value={form.id}
                        readOnly
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Corso <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={form.course_id}
                        onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleziona un corso</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Titolo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Server ID
                        </label>
                        <input
                            type="text"
                            value={form.server_id}
                            onChange={(e) => setForm({ ...form, server_id: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salva Modifiche
                    </button>
                </div>
            </form>
        </div>
    );
}
