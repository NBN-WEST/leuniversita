import { createAdminClient } from '@/utils/supabase/service';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const courseId = searchParams.get('courseId');

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (id) {
        const { data, error: dbError } = await supabase
            .from('modules')
            .select('*')
            .eq('id', id)
            .single();

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }
        return NextResponse.json({ data });
    }

    let query = supabase
        .from('modules')
        .select('*')
        .order('order_index', { ascending: true });

    if (courseId) {
        query = query.eq('course_id', courseId);
    }

    const { data, error: dbError } = await query;
    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { course_id, slug, title, server_id, order_index } = body;

    if (!course_id || !slug || !title) {
        return NextResponse.json({ error: 'Course, Slug and Title are required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data, error: insertError } = await adminSupabase
        .from('modules')
        .insert([{
            course_id,
            slug,
            title,
            server_id,
            order_index: Number.isFinite(order_index) ? order_index : 0,
            created_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, course_id, slug, title, server_id, order_index } = body;

    if (!id || !course_id || !slug || !title) {
        return NextResponse.json({ error: 'ID, Course, Slug and Title are required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data, error: updateError } = await adminSupabase
        .from('modules')
        .update({
            course_id,
            slug,
            title,
            server_id,
            order_index: Number.isFinite(order_index) ? order_index : 0
        })
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
