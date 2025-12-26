'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Activity, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const [stats, setStats] = useState({ diagnostics: 0, students: 0 });
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            // Stats fetching (allowed by RLS or public RPC usually, but here checking auth first)
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return; // Middleware handles redirect

            const { count: diagCount } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('event_name', 'diagnostic_completed');

            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setStats({
                diagnostics: diagCount || 0,
                students: userCount || 0
            });
        };
        fetchStats();
    }, []);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <div className="flex gap-3">
                    <Link href="/admin/courses" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4" />
                        Nuovo Corso
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Attività Recente</h3>
                </div>
                <div className="p-6 text-center py-12">
                    <p className="text-slate-500 text-sm">Nessuna attività da mostrare.</p>
                </div>
            </div>
        </div>
    );
}
