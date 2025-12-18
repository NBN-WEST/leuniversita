import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/Users/pabloliuzzi/Documents/Documents - Pablo’s MacBook Pro/antigravity-project/leuniversita-mvp/packages/ingestion/.env' });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    const { count } = await supabase.from('chunks').select('*', { count: 'exact', head: true }).eq('visibility', 'public');
    const safeCount = count || 0;
    console.log(`Public Chunks: ${safeCount}`);
    if (safeCount < 80) {
        console.error("FAIL: Public chunks < 80");
        process.exit(1);
    }
}
check();
