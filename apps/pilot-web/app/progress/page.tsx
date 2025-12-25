'use client';

import React, { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { ApiState } from "@/components/diagnostic/ApiState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProgressModule {
    module_id: string;
    status: string;
    last_score: number | null;
}

export default function ProgressPage() {
    const supabase = getSupabaseBrowserClient();
    const courseId = 'd7515f48-0d00-4824-a745-f09d30058e5f'; // default for MVP

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modules, setModules] = useState<ProgressModule[]>([]);

    const fetchProgress = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Non autorizzato.");

            const res = await fetch(`/api/progress?courseId=${courseId}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (!res.ok) throw new Error("Errore recupero progressi.");

            const data = await res.json();
            setModules(data.modules || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, []);

    if (loading) return <ApiState loading={true} error={null} loadingMessage="Analisi progressi..." />;
    if (error) return <ApiState loading={false} error={error} onRetry={fetchProgress} errorMessage="Impossibile caricare i dati" />;

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
            <h1 className="text-3xl font-bold">I tuoi Progressi</h1>

            {modules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Nessun dato disponibile. Inizia a studiare!
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {modules.map((mod, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium truncate" title={mod.module_id}>
                                    {mod.module_id}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <Badge variant={mod.status === 'completed' ? 'default' : 'secondary'}>
                                        {mod.status}
                                    </Badge>
                                    {mod.last_score !== null && (
                                        <span className="font-bold text-lg">{Math.round(mod.last_score)}%</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
