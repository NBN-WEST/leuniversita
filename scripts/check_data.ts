import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("--- COURSES ---");
    const { data: courses, error: cError } = await supabase
        .from('courses')
        .select('*');
    if (cError) console.error(cError);
    else console.table(courses);

    console.log("\n--- ASSESSMENTS V2 ---");
    const { data: assessments, error: aError } = await supabase
        .from('assessments_v2')
        .select('*');
    if (aError) console.error(aError);
    else console.table(assessments);
}

check();
