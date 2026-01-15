'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditLearningPathItemPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const itemId = resolvedParams.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        id: '',
        course_id: '',
        module_id: '',
        type: 'core',
        order_index: 0,
        status: 'active'
    });

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await fetch(`/api/admin/learning-paths/items?id=${itemId}`);
                if (!res.ok) throw new Error('Errore durante il recupero della voce');
                const json = await res.json();
                if (json.data) {
                    setForm({
                        id: json.data.id,
                        course_id: json.data.course_id,
                        module_id: json.data.module_id,
                        type: json.data.type || 'core',
                        order_index: json.data.order_index ?? 0,
                        status: json.data.status || 'active'
                    });
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItem();
    }, [itemId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/learning-paths/items', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: form.id,
                    type: form.type,
                    order_index: Number(form.order_index),
                    status: form.status
                })
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Errore durante l\'aggiornamento della voce');
            }

            router.push('/admin/learning-paths');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/learning-paths/items?id=${form.id}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Errore durante l\'eliminazione');
            }
            router.push('/admin/learning-paths');
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
                <Link href="/admin/learning-paths" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla lista
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Modifica Voce Learning Path</h1>
                <p className="text-slate-500">Aggiorna tipo, ordine e stato.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tipo
                    </label>
                    <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full max-w-xs px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full max-w-xs px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Stato
                    </label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full max-w-xs px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="active">Attivo</option>
                        <option value="archived">Archiviato</option>
                    </select>
                </div>

                <div className="pt-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                        Elimina
                    </button>

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
