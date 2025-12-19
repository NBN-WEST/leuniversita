'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';
import { Loader2, Calendar, FileText, CheckCircle } from 'lucide-react';

export default function PlanPage() {
    const { attemptId } = useParams();
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<any>(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        // Logic: Try fetching existing plan from DB if we stored it? 
        // MVP: Just generate it on fly via Edge Function 'study-plan' if not passed.
        // Or store it in local state. For MVP, let's call the function.
        // Wait, 'study-plan' function returns the plan. It doesn't persist it in a 'plans' table in previous steps (check logic).
        // Check check: Step 2 implemented 'study-plan'. It returns JSON.
        // We will call it on mount.

        const fetchPlan = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return; // auth handle elsewhere

            const { data, error } = await supabase.functions.invoke('study-plan', {
                body: { user_id: session.user.id, attempt_id: attemptId }
            });

            if (data?.plan) {
                setPlan(data.plan);
            }
            setLoading(false);
        };

        fetchPlan();
    }, [attemptId]);

    if (loading) {
        return (
            <div className="h-screen flex flex-col justify-center items-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-700 mb-4" />
                <p className="text-slate-500">L'IA sta elaborando il tuo percorso ottimale...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Il Tuo Piano di Studio</h1>
                    <p className="text-slate-500">Ottimizzato per recuperare le lacune in 7 giorni.</p>
                </div>

                <div className="space-y-6">
                    {plan?.week_1?.map((day: any, idx: number) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Giorno {day.day}</h3>
                            </div>

                            <div className="space-y-3">
                                {day.activities.map((act: any, i: number) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {act.type === 'reading' ? <FileText className="w-4 h-4 text-slate-400" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{act.description}</p>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{act.duration} min</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
