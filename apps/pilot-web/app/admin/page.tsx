'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Activity } from 'lucide-react';

export default function AdminPage() {
    const [stats, setStats] = useState({ diagnostics: 0, students: 0 });
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            // Basic Auth Check
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/login'); return; }

            // In a real app, check Role. Here allow if logged in for Pilot MVP demo.

            // Fetch Stats (Direct count if RLS allows or RPC)
            // Using analytics_events count as proxy
            const { count: diagCount } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('event_name', 'diagnostic_completed');

            // Count distinct users? (Not easy with simple supabase-js without rpc, use profiles count)
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setStats({
                diagnostics: diagCount || 0,
                students: userCount || 0
            });
        };
        fetchStats();
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard Docente / Admin</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Diagnostici Completati</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.diagnostics}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Studenti Attivi</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.students}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 bg-white rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Attività Recente</h3>
                <p className="text-slate-500 text-sm">Nessuna attività recente disponibile in tempo reale.</p>
            </div>
        </div>
    );
}
