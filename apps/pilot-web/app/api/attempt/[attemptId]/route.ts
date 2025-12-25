import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ attemptId: string }> }) {
    const params = await props.params;
    const attemptId = params.attemptId;
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch Attempt
    const { data: attempt, error } = await supabase
        .from('learning_attempts_v2')
        .select('id, score, max_score, level, status, completed_at')
        .eq('id', attemptId)
        .eq('user_id', user.id)
        .single();

    if (error || !attempt) {
        return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.status !== 'completed') {
        return NextResponse.json({ status: 'in_progress' });
    }

    return NextResponse.json({
        id: attempt.id,
        score: attempt.score,
        maxScore: attempt.max_score,
        level: attempt.level,
        completedAt: attempt.completed_at
    });
}
