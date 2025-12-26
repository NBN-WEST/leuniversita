'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultData } from '@/types/results';

export default function ResultsPage() {
    const params = useParams();
    const attemptId = params.attemptId as string;

    const supabase = getSupabaseBrowserClient();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResultData | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error("Sessione mancante.");

                const res = await fetch(`/api/attempt/${attemptId}`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });

                if (!res.ok) throw new Error("Errore recupero risultati.");

                const data = await res.json();
                if (data.status && data.status !== 'completed') {
                    throw new Error("Test non ancora completato.");
                }

                setResult(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (attemptId) fetchResults();
    }, [attemptId, supabase]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="container max-w-md mx-auto py-16 text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-xl font-bold">Impossibile caricare i risultati</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Torna alla Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto py-16 px-4 text-center space-y-8 animate-in fade-in duration-700">

            <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-100 p-6 shadow-sm">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Analisi Completata!</h1>
                <p className="text-xl text-muted-foreground">
                    Abbiamo creato il tuo percorso di studi personalizzato.
                </p>
            </div>

            <Card className="text-left bg-muted/30 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-primary" />
                        Il tuo Livello
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Punteggio ottenuto</span>
                            <span className="font-bold text-lg">{Math.round(result.score)}%</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Livello assegnato</span>
                            <span className="font-bold text-lg capitalize">{result.level}</span>
                        </div>
                        <p className="text-muted-foreground pt-2">
                            In base alle tue risposte, abbiamo adattato la difficoltà del corso.
                            Il piano è stato generato automaticamente per colmare le tue lacune.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-8">
                <Button asChild size="lg" className="w-full md:w-auto px-12">
                    <Link href="/plan">
                        Vedi il Piano di Studio <BookOpen className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
