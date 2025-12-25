import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase Env Vars');
            return NextResponse.json({ error: 'Server Misconfiguration' }, { status: 500 });
        }

        const functionUrl = `${supabaseUrl}/functions/v1/diagnostic-submit`;

        // Assuming payload contains { attemptId, answers } or these are destructured from it
        // If payload is directly { attemptId, answers }, then `const { attemptId, answers } = payload;` might be needed
        // or the payload itself is passed as { attemptId, answers }
        const { attemptId, answers } = payload; // Added based on the instruction's body change

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'apikey': supabaseKey
            },
            body: JSON.stringify({ attemptId, answers })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Edge Function Error:', response.status, errorText);
            return NextResponse.json({ error: 'Edge Function failed', details: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Route Logic Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
