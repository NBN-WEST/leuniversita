import { createAdminClient } from '@/utils/supabase/service';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (id) {
        const { data, error: dbError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', id)
            .single();

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }
        return NextResponse.json({ data });
    }

    const { data, error: dbError } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

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
    const { id, title, description, icon_name, is_active } = body;

    if (!id || !title) {
        return NextResponse.json({ error: 'ID and Title are required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data, error: insertError } = await adminSupabase
        .from('exams')
        .insert([{
            id,
            title,
            description,
            icon_name,
            is_active: typeof is_active === 'boolean' ? is_active : true,
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
    const { id, title, description, icon_name, is_active } = body;

    if (!id || !title) {
        return NextResponse.json({ error: 'ID and Title are required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data, error: updateError } = await adminSupabase
        .from('exams')
        .update({
            title,
            description,
            icon_name,
            ...(typeof is_active === 'boolean' ? { is_active } : {})
        })
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
