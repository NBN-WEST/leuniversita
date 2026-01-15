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
            .from('learning_path_items')
            .select('*, modules (id, title, slug), courses (title)')
            .eq('id', id)
            .single();

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }
        return NextResponse.json({ data });
    }

    if (!courseId) {
        return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const { data, error: dbError } = await supabase
        .from('learning_path_items')
        .select('*, modules (id, title, slug), courses (title)')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

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
    const { course_id, module_id, type, order_index, status } = body;

    if (!course_id || !module_id) {
        return NextResponse.json({ error: 'Course and Module are required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data, error: insertError } = await adminSupabase
        .from('learning_path_items')
        .insert([{
            course_id,
            module_id,
            type: type === 'reinforcement' ? 'reinforcement' : 'core',
            order_index: Number.isFinite(order_index) ? order_index : 0,
            status: status === 'archived' ? 'archived' : 'active',
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
    const { id, type, order_index, status } = body;

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data, error: updateError } = await adminSupabase
        .from('learning_path_items')
        .update({
            ...(type ? { type } : {}),
            ...(typeof order_index === 'number' ? { order_index } : {}),
            ...(status ? { status } : {})
        })
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { error: deleteError } = await adminSupabase
        .from('learning_path_items')
        .delete()
        .eq('id', id);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
