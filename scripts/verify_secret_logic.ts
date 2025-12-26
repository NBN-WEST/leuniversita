import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
const config = dotenv.config({ path: envPath }).parsed || {};

// Simulate Edge Function logic
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// In Edge Function: Deno.env.get('SERVICE_ROLE') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabaseKey = config.SUPABASE_SERVICE_ROLE_KEY; // We know this is the one we tried to set as SERVICE_ROLE

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing creds");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const attemptId = '9802c9f9-3d70-4457-9ea7-6a25411460eb';

async function verify() {
    console.log("Attempting update using simulating SERVICE_ROLE key...");

    const { data, error } = await supabase.from('learning_attempts_v2').update({
        status: 'completed',
        score: 100,
        level: 'advanced'
    }).eq('id', attemptId).select();

    if (error) {
        console.error("Update Failed:", error);
    } else {
        console.log("Update Succeeded:", data);
    }
}

verify();
