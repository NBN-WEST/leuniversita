import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load ENV from correct location (packages/ingestion/.env or root or apps/pilot-web... ingestion usually has its own or shares)
const envPathLocal = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
const envPathIngestion = path.resolve(process.cwd(), 'packages/ingestion/.env');

// Try loading both
dotenv.config({ path: envPathLocal });
dotenv.config({ path: envPathIngestion });

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: Anon key wont work for RLS checks usually, but for simple select might work.

if (!url || !key) {
    console.error("Missing ENV vars. URL:", !!url, "Key:", !!key);
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    let data, error;
    try {
        const result = await supabase.rpc('get_columns', { table_name: 'documents' });
        data = result.data;
        error = result.error;
    } catch (e) {
        error = e;
    }

    if (error) {
        // Fallback if RPC doesnt exist
        // Fallback if RPC doesnt exist, try direct query if RLS allows (unlikely on inf_schema via client)
        // Actually service role can bypass RLS but accessing information_schema via PostgREST is restricted often.
        // But we can try just selecting * from documents limit 0 and check keys?
        const result = await supabase.from('documents').select('*').limit(0);
        data = result.data;
        error = result.error;
    }

    if (data && data.length === 0 && !error) {
        // It's empty list, but keys might be in the object?
        // Actually fetch 1 row to see keys.
        const { data: rows } = await supabase.from('documents').select('*').limit(1);
        if (rows && rows.length > 0) {
            console.log("Columns:", Object.keys(rows[0]));
        } else {
            console.log("No rows to inspect columns. Trying error based approach.");
            // Try picking the column
            const { error: colError } = await supabase.from('documents').select('content_hash').limit(1);
            if (colError) {
                console.log("content_hash column likely MISSING:", colError.message);
            } else {
                console.log("content_hash column EXISTS.");
            }
        }
    } else {
        // Checking via select error is easiest
        const { error: colError } = await supabase.from('documents').select('content_hash').limit(1);
        if (colError) {
            console.log("content_hash column likely MISSING:", colError.message);
        } else {
            console.log("content_hash column EXISTS.");
        }
    }
}

check();
