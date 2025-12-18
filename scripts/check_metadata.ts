import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), 'packages/ingestion/.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log("Checking DB consistency...");

    // Get a public chunk
    const { data: chunks } = await supabase.from('chunks').select('*').eq('visibility', 'public').limit(1);
    if (!chunks || chunks.length === 0) {
        console.log("No public chunks found.");
        return;
    }
    const chunk = chunks[0];
    console.log(`Chunk ID: ${chunk.id}, Doc ID: ${chunk.document_id}`);

    // Get the document
    const { data: doc } = await supabase.from('documents').select('*').eq('id', chunk.document_id).single();
    if (doc) {
        console.log(`✅ FOUND Document: ${doc.title} (ID: ${doc.id})`);
    } else {
        console.log(`❌ MISSING Document for ID: ${chunk.document_id}`);
        // List all docs to see what's there
        const { data: allDocs } = await supabase.from('documents').select('id, title');
        console.log("Available Documents:", allDocs);
    }
}

main();
