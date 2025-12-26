import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const supabase = await createSupabaseServerClient();

    // Verify token (Cookie first, then Header)
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

    // Fetch active plan V2
    const { data: plan, error: planError } = await supabase
        .from('learning_plans_v2')
        .select('id, level, status, created_at')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (planError && planError.code !== 'PGRST116') { // PGRST116 is 'not found' for single()
        console.error("Plan Error", planError);
        // Don't fail, return empty items
    }

    if (!plan) return NextResponse.json({ items: [] });

    // Fetch Items V2
    const { data: items } = await supabase
        .from('plan_items_v2')
        .select(`
            *,
            modules ( title )
        `)
        .eq('plan_id', plan.id);

    const processedItems = (items || []).map((item: any, index: number) => {
        const raw = item.modules || {};
        const title = (raw.title || raw.name || raw.label || `Modulo ${index + 1}`).trim();
        return {
            ...item,
            modules: {
                ...raw,
                title
            }
        };
    });

    return NextResponse.json({
        planId: plan.id,
        status: plan.status,
        level: plan.level,
        items: processedItems
    });
}
