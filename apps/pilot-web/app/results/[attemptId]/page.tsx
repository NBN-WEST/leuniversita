'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Loader2, ArrowRight } from 'lucide-react';

export default function ResultsPage() {
    const { attemptId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]); // Init empty to prevent Recharts crash

    useEffect(() => {
        const fetchResults = async () => {
            const { data: attempt } = await supabase
                .from('diagnostic_attempts')
                .select('skill_map')
                .eq('id', attemptId)
                .eq('id', attemptId)
                .single();

            console.log("Attempt Fetch Result:", { attempt, error });

            if (error) console.error("Supabase Error:", error);

            if (attempt && attempt.skill_map?.topics) {
                // Transform for Recharts
                const topics = attempt.skill_map.topics || [];
                const chartData = topics.map((t: any) => ({
                    subject: t.topic,
                    A: t.score,
                    fullMark: 100
                }));
                setData(chartData);
            }
            setLoading(false);
        };
        fetchResults();
    }, [attemptId]);

    const generatePlan = () => {
        router.push(`/plan/${attemptId}`);
    };

    if (loading) return <div className="h-screen flex justify-center items-center"><Loader2 className="animate-spin text-blue-700" /></div>;

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">La tua Mappa delle Competenze</h1>
                <p className="text-slate-500 mb-8">Basato sulle risposte fornite nel test diagnostico.</p>

                <div className="h-96 w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Studente" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-left mb-8">
                    <h3 className="font-semibold text-blue-900 mb-2">Analisi Preliminare</h3>
                    <p className="text-blue-800 text-sm">
                        Abbiamo individuato alcune lacune in <strong>Contratti</strong> e <strong>Diritti Reali</strong>.
                        Il tuo piano di studio si concentrerà prioritariamente su queste aree per massimizzare il recupero.
                    </p>
                </div>

                <button onClick={generatePlan} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2 mx-auto">
                    Genera Piano di Studio 7 Giorni
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
