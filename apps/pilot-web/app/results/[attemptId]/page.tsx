'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ResultsPage() {
    const searchParams = useSearchParams();
    const score = searchParams.get('score');
    const level = searchParams.get('level');

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
                        {score && (
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-muted-foreground">Punteggio ottenuto</span>
                                <span className="font-bold text-lg">{Math.round(Number(score))}%</span>
                            </div>
                        )}
                        {level && (
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-muted-foreground">Livello assegnato</span>
                                <span className="font-bold text-lg capitalize">{level}</span>
                            </div>
                        )}
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
