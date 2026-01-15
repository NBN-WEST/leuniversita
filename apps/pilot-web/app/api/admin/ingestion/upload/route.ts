import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SAFE_EXAM_ID = /^[a-z0-9-_]+$/i;

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const examId = String(formData.get('examId') || '').trim();
    const file = formData.get('file') as File | null;

    if (!examId || !SAFE_EXAM_ID.test(examId)) {
        return NextResponse.json({ error: 'Invalid examId' }, { status: 400 });
    }

    if (!file) {
        return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const safeName = path.basename(file.name);
    if (!safeName.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    const destDir = path.resolve(process.cwd(), '../../docs/sources', examId, 'raw');
    const destPath = path.join(destDir, safeName);

    try {
        await fs.mkdir(destDir, { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(destPath, buffer);
        return NextResponse.json({ success: true, filename: safeName });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }
}
