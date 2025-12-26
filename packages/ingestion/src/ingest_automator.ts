import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';
import { PDFProcessor } from './lib/PDFProcessor';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { IngestionManager, Source } from './lib/IngestionManager';
import dotenv from 'dotenv';

// Load Environment
const envLocal = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
const envIngestion = path.resolve(process.cwd(), 'packages/ingestion/.env');
dotenv.config({ path: envLocal });
dotenv.config({ path: envIngestion });

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE;

if (!url || !key) {
    console.error("❌ Missing Supabase credentials for Automator");
    process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OpenAI API Key");
    process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
    console.log("🚀 Starting One-Command Ingestion Automator");

    // CLI Args
    const args = process.argv.slice(2);
    let examId = 'diritto-privato'; // Default
    const examIndex = args.indexOf('--exam');
    if (examIndex !== -1) examId = args[examIndex + 1];

    console.log(`🎓 Exam: ${examId}`);

    const baseSourcePath = path.resolve(CONFIG.REPO_ROOT, `docs/sources/${examId}`);
    const rawPath = path.join(baseSourcePath, 'raw');
    const processedPath = path.join(baseSourcePath, 'from_sources'); // Where MDs land

    // Ensure dirs
    if (!fs.existsSync(rawPath)) fs.mkdirSync(rawPath, { recursive: true });
    if (!fs.existsSync(processedPath)) fs.mkdirSync(processedPath, { recursive: true });

    // 1. Convert RAW PDFs -> Markdown
    // Scan raw recursively? For now check raw root and raw/private
    const processor = new PDFProcessor();
    const potentialPdfDirs = [rawPath, path.join(rawPath, 'private')];

    for (const pDir of potentialPdfDirs) {
        if (!fs.existsSync(pDir)) continue;
        const rawFiles = fs.readdirSync(pDir).filter(f => f.toLowerCase().endsWith('.pdf'));

        if (rawFiles.length > 0) {
            console.log(`\n📂 Found ${rawFiles.length} RAW PDF(s) in ${path.relative(baseSourcePath, pDir)}`);
            for (const file of rawFiles) {
                const sourcePath = path.join(pDir, file);
                const destName = file.replace(/\.pdf$/i, '.md');
                const destPath = path.join(processedPath, destName);

                if (fs.existsSync(destPath)) {
                    console.log(`   ⏭️  Skipping conversion for ${file} (Markdown already exists)`);
                    continue;
                }

                console.log(`   ⚙️  Converting ${file}...`);
                try {
                    await processor.processToMarkdown(sourcePath, destPath, {
                        source_url: 'INTERNAL_PDF',
                        license: 'INTERNAL'
                    });
                    console.log(`   ✅ Converted -> ${destName}`);
                } catch (e: any) {
                    console.error(`   ❌ Failed to convert ${file}: ${e.message}`);
                }
            }
        }
    }

    // 2. Ingest EVERYTHING (Public + Processed/FromSources + Private/RawPrivate)
    console.log("\n🤖 Triggering Universal Ingestion...");
    const manager = new IngestionManager(supabase, openai);

    // Scan 'public' + 'from_sources' + 'private'
    const dirs = [
        { path: path.join(baseSourcePath, 'public'), visibility: 'public' },
        { path: path.join(baseSourcePath, 'from_sources'), visibility: 'public' }, // Treat converted as public for MVP? Or private? Let's say public so chatbot sees them.
        { path: path.join(baseSourcePath, 'private'), visibility: 'private' },
        { path: path.join(baseSourcePath, 'raw/private'), visibility: 'private' } // Treat raw/private MDs as valid sources
    ];

    let stats = { total: 0, skipped: 0, ingested: 0, error: 0 };

    for (const d of dirs) {
        if (!fs.existsSync(d.path)) continue;

        const files = fs.readdirSync(d.path).filter(f => f.endsWith('.md'));
        for (const file of files) {
            // Skip ALPA for MVP if needed
            if (file.toLowerCase().includes('alpa')) {
                console.log(`⚠️  Skipping ALPA (MVP limit)`);
                continue;
            }

            const src: Source = {
                title: path.basename(file, '.md'),
                local_path: path.join(d.path, file),
                visibility: d.visibility as 'public' | 'private',
                exam_id: examId,
                // Source URL/License handled by frontmatter usually
            };

            stats.total++;
            const result = await manager.processDocument(src);
            if (result === 'skipped') stats.skipped++;
            if (result === 'ingested') stats.ingested++;
            if (result === 'error') stats.error++;
        }
    }

    console.log("\n📊 Automator Summary:");
    console.log(`   Total Candidates: ${stats.total}`);
    console.log(`   ✅ Ingested: ${stats.ingested}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.error}`);
}

main().catch(e => {
    console.error("Fatal:", e);
    process.exit(1);
});
