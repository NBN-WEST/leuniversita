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

    let resolvedCourseId = courseId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (resolvedCourseId && !uuidRegex.test(resolvedCourseId)) {
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('id')
            .eq('slug', resolvedCourseId)
            .single();

        if (courseError || !course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        resolvedCourseId = course.id;
    }

    const { data: progress, error: progError } = await supabase
        .from('learning_progress_v2')
        .select('module_id, status, last_score, modules (title, slug)')
        .eq('user_id', user.id)
        .eq('course_id', resolvedCourseId);

    if (progError) console.error("Progress Error", progError);

    // Normalize payload for frontend
    const modules = (progress || []).map((p: any) => ({
        module_id: p.module_id,
        status: p.status,
        last_score: p.last_score,
        module: p.modules
    }));

    return NextResponse.json({
        modules
    });
}
