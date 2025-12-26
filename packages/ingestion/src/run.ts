import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { CONFIG } from './config';
import { IngestionManager, Source } from './lib/IngestionManager';

// Load Env
const envLocal = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
const envIngestion = path.resolve(process.cwd(), 'packages/ingestion/.env');

dotenv.config({ path: envLocal });
dotenv.config({ path: envIngestion });

// --- Init Clients ---
// Note: ENV is already loaded by run-env.ts wrapper

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE;

if (!url || !key) {
    console.error("❌ Missing Supabase credentials (URL/Role Key)");
    process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OpenAI API Key");
    process.exit(1);
}

const supabase = createClient(
    url,
    key,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    }
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    console.log("🚀 Starting Hardened Ingestion Runner");
    console.log(`📂 CWD: ${process.cwd()}`);

    // CLI Arguments
    const args = process.argv.slice(2);
    let examId = 'diritto-privato';
    const examIndex = args.indexOf('--exam');
    if (examIndex !== -1) {
        examId = args[examIndex + 1];
    }

    console.log(`🎓 Target Exam: ${examId}`);

    const baseSourcePath = path.resolve(CONFIG.REPO_ROOT, `docs/sources/${examId}`);
    if (!fs.existsSync(baseSourcePath)) {
        console.error(`❌ Source directory not found: ${baseSourcePath}`);
        process.exit(1);
    }

    // Prepare Manager
    const manager = new IngestionManager(supabase, openai);

    // Recursive Crawl
    const sources: Source[] = [];

    function scanDir(dir: string, visibility: 'public' | 'private') {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath, visibility);
            } else if (file.endsWith('.md')) {
                sources.push({
                    title: path.basename(file, '.md'),
                    local_path: fullPath,
                    visibility: visibility,
                    exam_id: examId
                });
            }
        }
    }

    const publicPath = path.join(baseSourcePath, 'public');
    const privatePath = path.join(baseSourcePath, 'private');

    // Folder structure logic
    if (fs.existsSync(publicPath)) scanDir(publicPath, 'public');
    else if (fs.existsSync(baseSourcePath)) scanDir(baseSourcePath, 'public'); // Fallback

    if (fs.existsSync(privatePath)) scanDir(privatePath, 'private');

    console.log(`🔢 Found ${sources.length} sources to process.`);

    // CLI Filter: visibility
    const onlyVisibilityIndex = args.indexOf('--onlyVisibility');
    const onlyVisibility = onlyVisibilityIndex !== -1 ? args[onlyVisibilityIndex + 1] : null;

    if (onlyVisibility) {
        console.log(`ℹ️ Filter applied: Ingesting ONLY '${onlyVisibility}' sources.`);
    }

    // --- Execution Loop ---
    let stats = {
        total: 0,
        skipped: 0,
        ingested: 0,
        error: 0
    };

    for (const src of sources) {
        if (onlyVisibility && src.visibility !== onlyVisibility) continue;

        // MVP Deferral
        if (src.title.toLowerCase().includes('alpa')) {
            console.log(`⚠️ Alpa deferred (${src.title})`);
            continue;
        }

        stats.total++;
        const result = await manager.processDocument(src);

        if (result === 'skipped') stats.skipped++;
        if (result === 'ingested') stats.ingested++;
        if (result === 'error') stats.error++;
    }

    console.log("\n📊 Ingestion Summary:");
    console.log(`   Total Processed: ${stats.total}`);
    console.log(`   ✅ Ingested/Updated: ${stats.ingested}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.error}`);

    if (stats.error > 0) {
        process.exit(1);
    }
}

main().catch(err => {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
});
