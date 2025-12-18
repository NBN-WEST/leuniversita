import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load ENV
dotenv.config({ path: path.resolve(process.cwd(), 'packages/ingestion/.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log("🔍 Debugging Join Query...");

    // 1. Get a public chunk ID first
    const { data: chunks } = await supabase.from('chunks').select('id, document_id').eq('visibility', 'public').limit(1);

    if (!chunks || chunks.length === 0) {
        console.error("No public chunks found to test.");
        return;
    }

    const testChunkId = chunks[0].id;
    const testDocId = chunks[0].document_id;
    console.log(`Test Chunk ID: ${testChunkId}`);
    console.log(`Test Doc ID: ${testDocId}`);

    // 2. Run the exact query from Edge Function
    // .select('id, document_id, chunk_index, documents!inner(id, title, source_url)')
    const { data: result, error } = await supabase
        .from('chunks')
        .select('id, document_id, chunk_index, documents!inner(id, title, source_url)')
        .eq('id', testChunkId);

    if (error) {
        console.error("❌ Query Failed:", error);
    } else {
        console.log("✅ Query Result:", JSON.stringify(result, null, 2));
    }

    // 3. Check simple join without !inner matches anything
    const { data: resultRelaxed, error: errorRelaxed } = await supabase
        .from('chunks')
        .select('id, document_id, chunk_index, documents(*) ')
        .eq('id', testChunkId);

    if (errorRelaxed) {
        console.error("❌ Relaxed Query Failed:", errorRelaxed);
    } else {
        console.log("✅ Relaxed Query Result:", JSON.stringify(resultRelaxed, null, 2));
    }
}

main();
