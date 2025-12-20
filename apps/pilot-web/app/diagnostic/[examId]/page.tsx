'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

type Question = {
    id: string; // generated ID logic or topic
    type: 'MCQ' | 'OPEN';
    prompt: string;
    options?: string[];
    topic: string;
};

type UiHint = {
    total_questions: number;
};

export default function DiagnosticPage() {
    const { examId } = useParams();
    const router = useRouter();

    const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'submitting'>('idle');
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentIdx, setCurrentIdx] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const startTest = async () => {
        setStatus('loading');
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return router.push('/login');

        const { data, error } = await supabase.functions.invoke('diagnostic-start', {
            body: { user_id: session.user.id, exam_id: examId }
        });

        if (error || (data && data.error)) {
            setStatus('idle');
            const msg = error?.message || data?.error?.message || "Errore avvio test";
            if (msg.includes("Upgrade")) { // Simple check for rate limit string
                setError("Limite Raggiunto: Passa a Premium per continuare.");
            } else {
                setError(msg);
            }
            return;
        }

        setAttemptId(data.attempt_id);
        setQuestions(data.questions);
        setStatus('active');
    };

    const submitTest = async () => {
        setStatus('submitting');
        const { data: { session } } = await supabase.auth.getSession();

        // Construct answers list (simple format for MVP)
        const formattedAnswers = questions.map((q, idx) => ({
            question_id: idx.toString(), // MVP mapping
            question_text: q.prompt,
            topic: q.topic,
            selected_option: answers[idx] || "",
            text_response: q.type === 'OPEN' ? answers[idx] : undefined
        }));

        const { data, error } = await supabase.functions.invoke('diagnostic-submit', {
            body: {
                attempt_id: attemptId,
                user_id: session?.user.id,
                answers: formattedAnswers
            }
        });

        if (error) {
            setStatus('active');
            setError("Errore invio dati. Riprova.");
            return;
        }

        router.push(`/results/${attemptId}`);
    };

    const handleAnswer = (val: string) => {
        setAnswers(prev => ({ ...prev, [currentIdx]: val }));
    };

    const goNext = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
        } else {
            submitTest();
        }
    };

    // RENDERERS

    if (status === 'idle') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
                <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-sm text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Test Diagnostico</h1>
                    <p className="text-slate-600 mb-8">Il sistema valuterà la tua preparazione attuale su fonti ufficiali. Ci vorranno circa 5 minuti.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button onClick={startTest} className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-all">
                        Inizia Diagnostico
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'loading' || status === 'submitting') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-700 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium opacity-0 animate-pulse" style={{ opacity: 1 }}>{status === 'loading' ? 'Generazione Test...' : 'Valutazione in corso...'}</p>
                </div>
            </div>
        );
    }

    const q = questions[currentIdx];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Progress Header */}
            <div className="h-2 bg-slate-100 w-full">
                <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
            </div>

            <div className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 flex flex-col justify-center">
                <div className="mb-6">
                    <span className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-2 block">Domanda {currentIdx + 1} di {questions.length}</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{q.prompt}</h2>
                </div>

                <div className="space-y-3 mb-10">
                    {q.type === 'MCQ' && q.options?.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(opt)}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${answers[currentIdx] === opt
                                ? 'border-blue-600 bg-blue-50 text-blue-900 font-medium'
                                : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 font-medium'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentIdx] === opt ? 'border-blue-600' : 'border-slate-400'}`}>
                                    {answers[currentIdx] === opt && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                </div>
                                {opt}
                            </div>
                        </button>
                    ))}

                    {q.type === 'OPEN' && (
                        <textarea
                            className="w-full h-40 p-4 border-2 border-slate-300 rounded-xl focus:border-blue-500 outline-none resize-none text-slate-900 font-medium placeholder:text-slate-500"
                            placeholder="Scrivi la tua risposta qui..."
                            value={answers[currentIdx] || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                        />
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={goNext}
                        disabled={!answers[currentIdx]}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        {currentIdx === questions.length - 1 ? 'Concludi Test' : 'Avanti'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
