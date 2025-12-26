import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const supabase = await createSupabaseServerClient();

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

    const { data: progress, error: progError } = await supabase
        .from('learning_progress_v2')
        .select('module_id, state, last_score')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

    if (progError) console.error("Progress Error", progError);

    // Map 'state' to 'status' for frontend compatibility
    const modules = (progress || []).map((p: any) => ({
        module_id: p.module_id,
        status: p.state,
        last_score: p.last_score
    }));

    return NextResponse.json({
        modules
    });
}
