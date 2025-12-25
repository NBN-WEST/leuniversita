'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { ApiState } from "@/components/diagnostic/ApiState";
import { DiagnosticStepper } from "@/components/diagnostic/DiagnosticStepper";
import { QuestionCard } from "@/components/diagnostic/QuestionCard";

interface Question {
    id: string;
    prompt: string;
    question_options: { id: string; label: string }[];
}

export default function DiagnosticPage() {
    const router = useRouter();
    const params = useParams();
    const examId = params.examId as string;

    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));

    // State
    const [loading, setLoading] = useState(false); // Global loading (start/submit)
    const [error, setError] = useState<string | null>(null);
    const [started, setStarted] = useState(false);

    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId

    // --- Handlers ---

    const handleStart = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Sessione scaduta. Effettua nuovamente il login.");
            }

            const res = await fetch('/api/diagnostic/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ courseId: examId })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Errore durante l'avvio del test.");
            }

            const data = await res.json();
            setAttemptId(data.attemptId);
            setQuestions(data.questions);
            setStarted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (optionId: string) => {
        const currentQ = questions[currentQuestionIndex];
        setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!attemptId) return;
        setLoading(true);
        setError(null);

        const payloadAnswers = Object.entries(answers).map(([qId, oId]) => ({
            questionId: qId,
            selectedOptionId: oId
        }));

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessione mancante.");

            const res = await fetch('/api/diagnostic/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    attemptId,
                    answers: payloadAnswers
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Errore durante l'invio delle risposte.");
            }

            // Success -> Redirect to Results
            const data = await res.json();
            const { score, placementLevel } = data;
            router.push(`/results/${attemptId}?score=${score}&level=${placementLevel}`);

        } catch (err: any) {
            setError(err.message);
            setLoading(false); // Only stop loading on error, otherwise we navigate
        }
    };

    // --- Render ---

    // 1. Loading/Error State (Global)
    if (loading && !started) {
        return (
            <ApiState loading={true} error={null} loadingMessage="Preparazione del test in corso..." />
        );
    }

    // 2. Start Screen
    if (!started) {
        return (
            <div className="container max-w-2xl mx-auto py-12 px-4 text-center space-y-8">
                <ApiState loading={false} error={error} onRetry={handleStart}>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight">Diagnostic Test</h1>
                        <p className="text-muted-foreground text-lg">
                            Scopriamo a che punto sei. Bastano 5 minuti per analizzare le tue conoscenze e creare un piano di studio su misura.
                        </p>
                    </div>
                    <Button size="lg" onClick={handleStart} className="w-full md:w-auto px-8">
                        Inizia il Test <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </ApiState>
            </div>
        );
    }

    // 3. Question Loop
    if (loading) {
        return (
            <ApiState loading={true} error={null} loadingMessage="Analisi delle risposte in corso..." />
        );
    }

    if (error) {
        return (
            <ApiState loading={false} error={error} onRetry={handleSubmit} errorMessage="Si è verificato un errore durante l'invio." />
        );
    }

    const currentQ = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const canProceed = !!answers[currentQ.id];

    return (
        <div className="container max-w-3xl mx-auto py-8 px-4 flex flex-col min-h-[80vh]">
            <DiagnosticStepper
                currentIndex={currentQuestionIndex}
                totalQuestions={questions.length}
            />

            <div className="flex-grow flex items-center">
                <QuestionCard
                    question={currentQ}
                    selectedOptionId={answers[currentQ.id]}
                    onSelectOption={handleSelectOption}
                />
            </div>

            <div className="mt-8 flex justify-between items-center pt-4 border-t">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
                </Button>

                {isLastQuestion ? (
                    <Button onClick={handleSubmit} disabled={!canProceed} variant="default">
                        Invia Risposte <CheckCircle className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleNext} disabled={!canProceed}>
                        Avanti <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
