'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { ApiState } from "@/components/diagnostic/ApiState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Exam = { id: string; title: string };
type TopicRow = { topic: string; mastery_score: number; trend: string; last_reviewed: string };
type SummaryRow = { exam_id: string; avg_score: number; topics: number };

export default function SkillMapPage() {
    const supabase = getSupabaseBrowserClient();
    const router = useRouter();

    const [examId, setExamId] = useState<string>('all');
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [topics, setTopics] = useState<TopicRow[]>([]);
    const [summary, setSummary] = useState<SummaryRow[]>([]);

    const fetchExams = async (token: string) => {
        const res = await fetch('/api/exams', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setExams(data.data || []);
    };

    const fetchSkillMap = async (token: string, exam: string) => {
        const res = await fetch(`/api/skill-map?examId=${encodeURIComponent(exam)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Errore nel recupero Skill Map');
        }

        const data = await res.json();
        if (exam === 'all') {
            setSummary(data.summary || []);
            setTopics([]);
        } else {
            setTopics(data.topics || []);
            setSummary([]);
        }
    };

    const load = async (activeExam?: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            await fetchExams(session.access_token);
            await fetchSkillMap(session.access_token, activeExam || examId);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (examId) {
            load(examId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examId]);

    if (loading) return <ApiState loading={true} error={null} loadingMessage="Caricamento Skill Map..." />;
    if (error) return <ApiState loading={false} error={error} onRetry={load} errorMessage="Impossibile caricare la Skill Map" />;

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Skill Map</h1>
                <div className="min-w-[220px]">
                    <select
                        value={examId}
                        onChange={(e) => setExamId(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tutti gli esami</option>
                        {exams.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                                {exam.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {examId === 'all' ? (
                summary.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Nessun dato disponibile.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {summary.map((item) => (
                            <Card key={item.exam_id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-medium">{item.exam_id}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Media</span>
                                        <span className="text-xl font-bold">{item.avg_score}%</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">Topic: {item.topics}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            ) : topics.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Nessun dato disponibile per questo esame.
                </div>
            ) : (
                <div className="grid gap-4">
                    {topics.map((topic, index) => (
                        <Card key={`${topic.topic}-${index}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium">{topic.topic}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary">{topic.trend || 'stable'}</Badge>
                                    <span className="text-lg font-bold">{Math.round(topic.mastery_score || 0)}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-blue-600"
                                        style={{ width: `${Math.min(100, Math.max(0, topic.mastery_score || 0))}%` }}
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Ultimo aggiornamento: {topic.last_reviewed ? new Date(topic.last_reviewed).toLocaleDateString('it-IT') : 'N/D'}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
