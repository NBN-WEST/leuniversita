import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId') || 'all';

    let { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user: userFromToken }, error: tokenError } = await supabase.auth.getUser(token);
            if (userFromToken && !tokenError) {
                user = userFromToken;
                authError = null;
            }
        }
    }

    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (examId === 'all') {
        const { data, error } = await supabase
            .from('learning_progress')
            .select('exam_id, mastery_score');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const summary: Record<string, { exam_id: string; avg_score: number; topics: number }> = {};
        for (const row of data || []) {
            if (!summary[row.exam_id]) {
                summary[row.exam_id] = { exam_id: row.exam_id, avg_score: 0, topics: 0 };
            }
            summary[row.exam_id].avg_score += row.mastery_score || 0;
            summary[row.exam_id].topics += 1;
        }

        const result = Object.values(summary).map((item) => ({
            ...item,
            avg_score: item.topics > 0 ? Math.round(item.avg_score / item.topics) : 0
        }));

        return NextResponse.json({ summary: result });
    }

    const { data, error } = await supabase
        .from('learning_progress')
        .select('topic, mastery_score, trend, last_reviewed, exam_id')
        .eq('exam_id', examId)
        .order('mastery_score', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ topics: data || [] });
}
