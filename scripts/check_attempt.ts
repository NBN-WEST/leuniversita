import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const attemptId = 'f95d0060-c63f-4ece-806a-fd0522b3c50a'; // From user URL

async function check() {
    console.log(`Checking attempt: ${attemptId}`);
    const { data, error } = await supabase
        .from('learning_attempts_v2')
        .select('*')
        .eq('id', attemptId)
        .single();

    if (error) console.error(error);
    else console.log(data);
}

check();
