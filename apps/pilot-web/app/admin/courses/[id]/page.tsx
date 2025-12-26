'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const courseId = resolvedParams.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: ''
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/admin/courses?id=${courseId}`);
                if (!res.ok) throw new Error("Errore durante il recupero del corso");
                const json = await res.json();
                if (json.data) {
                    setForm({
                        title: json.data.title,
                        slug: json.data.slug,
                        description: json.data.description || ''
                    });
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/courses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, id: courseId })
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Errore durante l\'aggiornamento del corso');
            }

            // Success
            router.push('/admin/courses');
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
                <Link href="/admin/courses" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla lista
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Modifica Corso</h1>
                <p className="text-slate-500">Aggiorna le informazioni del corso.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Titolo Corso <span className="text-red-500">*</span>
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
                        Slug (ID univoco) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Descrizione
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
