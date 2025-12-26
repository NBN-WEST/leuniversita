'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewCoursePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: ''
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        // Auto-generate slug from title if slug hasn't been manually edited
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

        setForm(prev => ({
            ...prev,
            title,
            slug: prev.slug === '' || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
                ? slug
                : prev.slug
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Errore durante la creazione del corso');
            }

            // Success
            router.push('/admin/courses');
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
                <Link href="/admin/courses" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla lista
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Nuovo Corso</h1>
                <p className="text-slate-500">Crea un nuovo contenitore per le materie di studio.</p>
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
                        onChange={handleTitleChange}
                        placeholder="es. Diritto Pubblico"
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
                        placeholder="es. diritto_pubblico"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-slate-400">Identificativo usato negli URL. Solo lettere minuscole, numeri e underscore.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Descrizione
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        placeholder="Breve descrizione del corso..."
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salva Corso
                    </button>
                </div>
            </form>
        </div>
    );
}
