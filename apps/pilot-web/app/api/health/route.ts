import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({
            status: 'error',
            message: 'Missing configuration',
            timestamp: new Date().toISOString()
        }, { status: 503 });
    }

    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: 'configured'
    }, { status: 200 });
}
