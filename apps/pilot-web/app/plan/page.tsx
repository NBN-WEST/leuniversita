'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ApiState } from "@/components/diagnostic/ApiState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Circle, Lock, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface PlanItem {
    id: string;
    module_id: string;
    status: 'todo' | 'done' | 'skipped' | 'locked';
    type: string;
}

interface PlanData {
    planId: string;
    level: string;
    items: PlanItem[];
}

export default function PlanPage() {
    const [supabase] = useState(() => createClientComponentClient());
    const searchParams = useSearchParams();
    // Default courseId if not provided (e.g. from nav) - ideally should be dynamic or context
    // For MVP/Smoke, we often hardcode a known course or fetch active. 
    // Let's assume a default 'diritto-privato' or from URL.
    // Wait, the API needs courseId. 
    // We'll try to guess or use a default.
    // FIX: The user prompt implementation plan didn't specify how to carry courseId.
    // I will assume Diritto Privato (UUID: d7515f48-0d00-4824-a745-f09d30058e5f) 
    // OR the slug 'diritto-privato'. The API mostly takes the UUID after fixes.
    // Let's rely on the API finding the plan by User + Active Status primarily, 
    // but sending courseId is safer if user has multiple.
    const courseId = 'd7515f48-0d00-4824-a745-f09d30058e5f';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<PlanData | null>(null);

    const fetchPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Accedi per vedere il tuo piano.");

            const res = await fetch(`/api/plan/current?courseId=${courseId}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (!res.ok) throw new Error("Impossibile caricare il piano.");

            const data = await res.json();
            setPlan(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Status Badge Helper
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'locked': return <Lock className="h-4 w-4 text-muted-foreground" />;
            default: return <Circle className="h-4 w-4 text-primary" />;
        }
    };

    if (loading) return <ApiState loading={true} error={null} loadingMessage="Caricamento del tuo piano..." />;
    if (error) return <ApiState loading={false} error={error} onRetry={fetchPlan} errorMessage="Errore caricamento piano" />;

    // Empty State
    if (!plan || !plan.items || plan.items.length === 0) {
        return (
            <div className="container max-w-3xl mx-auto py-12 px-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Nessun piano attivo</h2>
                <p className="text-muted-foreground mb-8">Non hai ancora un piano di studio. Fai il test diagnostico.</p>
                <Button asChild>
                    <Link href="/diagnostic/diritto-privato">Inizia Test Diagnostico</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Il tuo Piano di Studio</h1>
                    <p className="text-muted-foreground">Livello: <Badge variant="outline" className="ml-2 capitalize">{plan.level}</Badge></p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/progress">
                        Vedi Statistiche <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="space-y-4">
                {plan.items.map((item, index) => (
                    <Card key={item.id} className="transition-all hover:bg-muted/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="flex-shrink-0 w-8 flex justify-center">
                                {getStatusIcon(item.status)}
                            </div>
                            <div className="flex-grow">
                                interface PlanItem {
                                    id: string;
                                module_id: string;
                                status: 'todo' | 'done' | 'skipped' | 'locked';
                                type: string;
                                modules?: {title: string };
}
                                // ... (inside component)
                                <h4 className="font-semibold text-base">
                                    {item.modules?.title || item.module_id}
                                </h4>
                                <p className="text-xs text-muted-foreground capitalize">Stato: {item.status}</p>
                            </div>
                            <div>
                                <Button size="sm" variant="ghost" disabled={item.status === 'locked'}>
                                    Apri
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
