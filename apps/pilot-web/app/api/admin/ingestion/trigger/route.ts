import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { examId } = await request.json().catch(() => ({ examId: '' }));
    if (!examId) {
        return NextResponse.json({ error: 'Missing examId' }, { status: 400 });
    }

    if (process.env.ENABLE_INGESTION_EXEC !== 'true') {
        return NextResponse.json({
            error: 'Ingestion exec disabled. Set ENABLE_INGESTION_EXEC=true to allow.'
        }, { status: 400 });
    }

    try {
        const command = `npx dotenvx run -f packages/ingestion/.env -- npx ts-node packages/ingestion/src/ingest_automator.ts --exam ${String(examId)}`;
        const { stdout, stderr } = await execAsync(command, {
            cwd: process.cwd() + '/../../',
            timeout: 5 * 60 * 1000,
            env: {
                ...process.env
            }
        });

        return NextResponse.json({
            success: true,
            stdout: stdout?.slice(0, 2000) || '',
            stderr: stderr?.slice(0, 2000) || ''
        });
    } catch (err: any) {
        return NextResponse.json({
            error: 'Ingestion failed',
            detail: err?.message || 'Unknown error'
        }, { status: 500 });
    }
}
