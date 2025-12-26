import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    const { data, error } = await supabase
        .from('learning_attempts_v2')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) console.error(error);
    else console.log(data);
}

check();
