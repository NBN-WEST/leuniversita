'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronRight, LogOut, GraduationCap } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description: string;
}

export default function Home() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        setExams(data);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin w-6 h-6 border-b-2 border-blue-700 rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-800 font-semibold text-lg">
          <GraduationCap className="w-6 h-6" />
          <span>Le Università</span>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium">
          <LogOut className="w-4 h-4" />
          Esci
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">I Miei Corsi</h1>
          <p className="text-slate-600">Seleziona un insegnamento per iniziare il percorso di studio adattivo.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer" onClick={() => router.push(`/diagnostic/${exam.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-700" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{exam.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{exam.description || 'Corso accademico abilitato.'}</p>
              <button className="w-full py-2 bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all">
                Accedi al Corso
              </button>
            </div>
          ))}

          {exams.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-500">
              Nessun corso attivo trovato.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
