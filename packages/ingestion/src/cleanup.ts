import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load ENV
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function clean() {
    console.log("🧹 Cleaning up Alpa...");
    const { data: docs } = await supabase.from('documents').select('id, title').ilike('title', '%alpa%');

    if (docs && docs.length > 0) {
        for (const d of docs) {
            console.log(`Deleting ${d.title} (${d.id})...`);
            await supabase.from('documents').delete().eq('id', d.id);
        }
        console.log("✅ Deleted.");
    } else {
        console.log("No Alpa found.");
    }
}

clean().catch(console.error);
