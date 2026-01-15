'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { ApiState } from "@/components/diagnostic/ApiState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProgressModule {
    module_id: string;
    status: string;
    last_score: number | null;
    module?: {
        title?: string;
        slug?: string;
    };
}

export default function ProgressPage() {
    const supabase = getSupabaseBrowserClient();
    const router = useRouter();

    const [courseId, setCourseId] = useState<string>('');
    const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modules, setModules] = useState<ProgressModule[]>([]);

    const fetchCourses = async (token: string) => {
        const res = await fetch('/api/courses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setCourses(data.data || []);
        if (!courseId && data.data?.[0]?.id) {
            setCourseId(data.data[0].id);
        }
    };

    const fetchProgress = async (activeCourseId?: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                throw new Error("Non autorizzato.");
            }

            await fetchCourses(session.access_token);

            const res = await fetch(`/api/progress?courseId=${activeCourseId || courseId}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (res.status === 401) {
                await supabase.auth.signOut();
                router.push('/login');
                throw new Error("Sessione scaduta.");
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Errore recupero progressi.");
            }

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

    useEffect(() => {
        if (courseId) {
            fetchProgress(courseId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    if (loading) return <ApiState loading={true} error={null} loadingMessage="Analisi progressi..." />;
    if (error) return <ApiState loading={false} error={error} onRetry={fetchProgress} errorMessage="Impossibile caricare i dati" />;

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Progressi Moduli</h1>
                    <p className="text-sm text-muted-foreground">Stato avanzamento per corso.</p>
                </div>
                <div className="min-w-[220px]">
                    <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-3">
                <a href="/skill-map" className="text-sm text-blue-600 hover:text-blue-700">
                    Vai alla Skill Map
                </a>
            </div>

            {modules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Nessun dato disponibile. Inizia a studiare!
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {modules.map((mod, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium truncate" title={mod.module?.title || mod.module_id}>
                                    {mod.module?.title || mod.module_id}
                                </CardTitle>
                                {mod.module?.slug && (
                                    <span className="text-xs text-muted-foreground">{mod.module.slug}</span>
                                )}
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
