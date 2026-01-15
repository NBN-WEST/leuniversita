import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 1. RBAC Check
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role in metadata
    if (user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch Data
    if (id) {
        const { data, error: dbError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }
        return NextResponse.json({ data });
    } else {
        const { data, error: dbError } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }
        return NextResponse.json({ data });
    }
}

export async function PUT(request: NextRequest) {
    const supabase = await createClient();

    // 1. RBAC Check
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse Body
    const body = await request.json();
    const { id, title, slug, description, status } = body;

    if (!id || !title || !slug) {
        return NextResponse.json({ error: 'ID, Title and Slug are required' }, { status: 400 });
    }

    // 3. Update Data (Requires Admin Client)
    const adminSupabase = createAdminClient();
    const safeStatus = ['draft', 'published', 'archived'].includes(status) ? status : undefined;
    const { data, error: updateError } = await adminSupabase
        .from('courses')
        .update({
            title,
            slug,
            description,
            ...(safeStatus ? { status: safeStatus } : {}),
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // 1. RBAC Check
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse Body
    const body = await request.json();
    const { title, slug, description, status } = body;

    if (!title || !slug) {
        return NextResponse.json({ error: 'Title and Slug are required' }, { status: 400 });
    }

    // 3. Insert Data (Requires Admin Client to bypass RLS if no policy exists for insert)
    const adminSupabase = createAdminClient();
    const safeStatus = ['draft', 'published', 'archived'].includes(status) ? status : 'draft';
    const { data, error: insertError } = await adminSupabase
        .from('courses')
        .insert([{
            title,
            slug,
            description,
            status: safeStatus,
            created_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
