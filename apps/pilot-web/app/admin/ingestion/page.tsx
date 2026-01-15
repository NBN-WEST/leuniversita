'use client';

import { useEffect, useMemo, useState } from 'react';
import { Upload, PlayCircle, RefreshCw } from 'lucide-react';

type SourceFile = {
    name: string;
    size: number;
};

export default function IngestionPage() {
    const [examId, setExamId] = useState('diritto-privato');
    const [files, setFiles] = useState<SourceFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isTriggering, setIsTriggering] = useState(false);

    const canSubmit = useMemo(() => examId.trim().length > 0, [examId]);

    const loadSources = async () => {
        if (!examId) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/admin/ingestion/sources?examId=${encodeURIComponent(examId)}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Errore nel caricamento fonti');
            setFiles(json.files || []);
        } catch (err: any) {
            setMessage(err?.message || 'Errore nel caricamento fonti');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        const form = event.currentTarget;
        const formData = new FormData(form);
        formData.set('examId', examId);

        try {
            const res = await fetch('/api/admin/ingestion/upload', {
                method: 'POST',
                body: formData
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Upload fallito');
            setMessage('✅ File caricato con successo.');
            form.reset();
            await loadSources();
        } catch (err: any) {
            setMessage(err?.message || 'Upload fallito');
        }
    };

    const handleTrigger = async () => {
        setIsTriggering(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/ingestion/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Ingestion fallita');
            setMessage('✅ Ingestion avviata. Controlla i log del server.');
        } catch (err: any) {
            setMessage(err?.message || 'Ingestion fallita');
        } finally {
            setIsTriggering(false);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Ingestion Sources</h1>
                <p className="text-slate-500">Carica PDF in `docs/sources/&lt;examId&gt;/raw` e avvia l’ingestion per l’esame selezionato.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <label className="block text-sm font-medium text-slate-700">Exam ID</label>
                <input
                    type="text"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="es. diritto-privato"
                />

                <form onSubmit={handleUpload} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">File PDF</label>
                        <input
                            type="file"
                            name="file"
                            accept="application/pdf"
                            className="mt-2 block w-full text-sm text-slate-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        Carica fonte
                    </button>
                </form>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleTrigger}
                        disabled={!canSubmit || isTriggering}
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <PlayCircle className="w-4 h-4" />
                        Avvia ingestion
                    </button>
                    <button
                        type="button"
                        onClick={loadSources}
                        disabled={loading}
                        className="inline-flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Aggiorna lista
                    </button>
                </div>

                {message && (
                    <div className="text-sm text-slate-700">{message}</div>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Fonti caricate</h2>
                {loading ? (
                    <div className="text-slate-500">Caricamento...</div>
                ) : files.length === 0 ? (
                    <div className="text-slate-500">Nessuna fonte trovata.</div>
                ) : (
                    <ul className="space-y-2 text-sm text-slate-700">
                        {files.map((file) => (
                            <li key={file.name} className="flex justify-between">
                                <span>{file.name}</span>
                                <span className="text-slate-400">{Math.round(file.size / 1024)} KB</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
