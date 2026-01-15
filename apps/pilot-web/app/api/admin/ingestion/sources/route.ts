import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SAFE_EXAM_ID = /^[a-z0-9-_]+$/i;

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId')?.trim();
    if (!examId || !SAFE_EXAM_ID.test(examId)) {
        return NextResponse.json({ error: 'Invalid examId' }, { status: 400 });
    }

    const sourcesDir = path.resolve(process.cwd(), '../../docs/sources', examId);
    try {
        const folders = ['raw', 'public', 'from_sources'];
        const files: { name: string; size: number }[] = [];

        for (const folder of folders) {
            const dir = path.join(sourcesDir, folder);
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    if (!entry.isFile()) continue;
                    const filePath = path.join(dir, entry.name);
                    const stat = await fs.stat(filePath);
                    files.push({
                        name: `${folder}/${entry.name}`,
                        size: stat.size
                    });
                }
            } catch (innerErr: any) {
                if (innerErr?.code !== 'ENOENT') {
                    throw innerErr;
                }
            }
        }

        return NextResponse.json({ files });
    } catch (err: any) {
        if (err?.code === 'ENOENT') {
            return NextResponse.json({ files: [] });
        }
        return NextResponse.json({ error: 'Failed to list sources' }, { status: 500 });
    }
}
