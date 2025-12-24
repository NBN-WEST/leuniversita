import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    // Create client with user token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
    });

    // Verify token (optional, RLS handles it but good for debug)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
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
        .select('*')
        .eq('plan_id', plan.id);

    return NextResponse.json({
        planId: plan.id,
        status: plan.status,
        level: plan.level,
        items: items || []
    });
}
