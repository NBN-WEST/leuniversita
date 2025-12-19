import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CONFIG } from './config';

// --- Configuration ---
const REPORT_PATH = path.resolve(CONFIG.REPO_ROOT, 'docs/reports/ingestion_validation_diritto_privato_v1.md');

// --- Types ---
interface Source {
    title: string;
    local_path: string;
    visibility: 'public' | 'private';
    source_url?: string;
    license?: string;
}

// --- Init Clients ---
// Note: ENV is already loaded by run-env.ts, but we check again for safety
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OpenAI API Key");
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    console.log("🚀 Starting Ingestion Runner (Multi-Exam)");
    console.log(`📂 CWD: ${process.cwd()}`);

    // CLI Arguments
    const args = process.argv.slice(2);

    // Parse --exam
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
                    visibility: visibility
                });
            }
        }
    }

    // Check canonical paths
    const publicPath = path.join(baseSourcePath, 'public');
    const privatePath = path.join(baseSourcePath, 'private');

    // Fallback: Check root if no subfolders (for backward compat if files moved messily)
    // But Step 4 instructions say we refactored.
    if (fs.existsSync(publicPath)) scanDir(publicPath, 'public');
    else if (fs.existsSync(baseSourcePath)) scanDir(baseSourcePath, 'public'); // Treat root as public if structured dirs missing

    if (fs.existsSync(privatePath)) scanDir(privatePath, 'private');

    console.log(`🔢 Found ${sources.length} sources to process.`);

    if (sources.length === 0) {
        console.warn("⚠️ No sources found to ingest.");
        // We do typically validatation even if empty to show DB count
    }

    const ingestionLogs: string[] = [];
    const log = (msg: string) => { console.log(msg); ingestionLogs.push(msg); };
    const err = (msg: string) => { console.error(msg); ingestionLogs.push(msg); };

    // CLI Filter: visibility
    const onlyVisibilityIndex = args.indexOf('--onlyVisibility');
    const onlyVisibility = onlyVisibilityIndex !== -1 ? args[onlyVisibilityIndex + 1] : null;

    if (onlyVisibility) {
        log(`ℹ️ Filter applied: Ingesting ONLY '${onlyVisibility}' sources.`);
    }

    for (const src of sources) {
        // --- Visibility Filter ---
        if (onlyVisibility && src.visibility !== onlyVisibility) {
            continue;
        }

        // --- SKIPPING ALPA (MVP Deferral) ---
        if (src.title.toLowerCase().includes('alpa')) {
            log(`⚠️ Alpa deferred: file too large for MVP run (${src.title})`);
            continue;
        }

        // Full Path is already resolved in scanDir
        const fullPath = src.local_path;

        log(`\n🔍 Processing: ${src.title}`);

        // --- Idempotency (Replace Strategy) ---
        // 1. Find existing document
        const { data: existingDocs } = await supabase
            .from(CONFIG.DB_TABLE_DOCUMENTS)
            .select('id')
            .eq('exam_id', examId)
            .eq('title', src.title)
            .limit(1);

        if (existingDocs && existingDocs.length > 0) {
            log(`   ♻️ Document exists (ID: ${existingDocs[0].id}). Replacing...`);
            const { error: delError } = await supabase
                .from(CONFIG.DB_TABLE_DOCUMENTS)
                .delete()
                .eq('id', existingDocs[0].id);

            if (delError) {
                err(`❌ Failed to delete existing document: ${delError.message}`);
                continue;
            }
        }

        // --- Ingestion ---
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        const { content: markdownBody, data: frontmatter } = matter(fileContent);

        // Insert Document
        const { data: docInsert, error: docError } = await supabase
            .from(CONFIG.DB_TABLE_DOCUMENTS)
            .insert({
                exam_id: examId,
                title: src.title,
                source_url: frontmatter.source_url || src.source_url || null,
                license: frontmatter.license || src.license || null
            })
            .select()
            .single();

        if (docError || !docInsert) {
            err(`❌ Failed to insert document: ${docError?.message}`);
            continue;
        }

        const docId = docInsert.id;
        // Chunking
        const effectiveChunkSize = src.visibility === 'public' ? 300 : CONFIG.CHUNK_SIZE;
        const effectiveOverlap = src.visibility === 'public' ? 50 : CONFIG.CHUNK_OVERLAP;

        const chunks = chunkText(markdownBody, effectiveChunkSize, effectiveOverlap);
        let chunksInserted = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunkContent = chunks[i];

            // Embedding
            let embedding;
            try {
                const response = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: chunkContent,
                    encoding_format: "float",
                });
                embedding = response.data[0].embedding;
            } catch (e: any) {
                err(`❌ OpenAI Error: ${e.message}`);
                continue;
            }

            // Insert Chunk
            const { error: chunkError } = await supabase
                .from(CONFIG.DB_TABLE_CHUNKS)
                .insert({
                    document_id: docId,
                    exam_id: examId,
                    chunk_index: i,
                    content: chunkContent,
                    embedding: embedding,
                    visibility: src.visibility
                });

            if (chunkError) {
                err(`❌ Chunk insert error: ${chunkError.message}`);
            } else {
                chunksInserted++;
            }
        }
        log(`   ✔ Ingested: ${src.title} (${chunksInserted} chunks)`);
    }

    log("\n✅ Ingestion completed.");

    // --- Automated Validation ---
    await validate(examId, ingestionLogs);
}

// Cosine similarity helper for fallback
function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dot = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function validate(examId: string, logs: string[]) {
    console.log("\n🕵️ Starting Validation...");
    const reportLines: string[] = [];
    const report = (line: string) => reportLines.push(line);

    report("# Ingestion Validation Report - Diritto Privato");
    report(`Date: ${new Date().toISOString()}`);
    report("");

    report("## 1. ENV Check");
    report("- SUPABASE_URL: OK");
    report("- OPENAI_API_KEY: OK");
    report("");

    report("## 2. Ingestion Logs");
    report("```");
    logs.forEach(l => report(l));
    report("```");
    report("");

    report("## 3. DB Counts");
    const { count: docCount } = await supabase
        .from(CONFIG.DB_TABLE_DOCUMENTS)
        .select('*', { count: 'exact', head: true })
        .eq('exam_id', examId);

    const { count: chunkCount } = await supabase
        .from(CONFIG.DB_TABLE_CHUNKS)
        .select('*', { count: 'exact', head: true })
        .eq('exam_id', examId);

    // Visibility breakdown
    const { data: chunksVis } = await supabase
        .from(CONFIG.DB_TABLE_CHUNKS)
        .select('visibility')
        .eq('exam_id', examId);

    const visCounts = chunksVis?.reduce((acc: any, curr) => {
        acc[curr.visibility] = (acc[curr.visibility] || 0) + 1;
        return acc;
    }, {}) || {};

    report(`- Documents: ${docCount}`);
    report(`- Chunks (Total): ${chunkCount}`);
    report(`- Chunks (Public): ${visCounts['public'] || 0}`);
    report(`- Chunks (Private): ${visCounts['private'] || 0}`);
    report("");

    report("## 4. Retrieval Test");
    const query = "capacità di agire";
    report(`Query: "${query}"`);
    console.log(`Querying: ${query}`);

    let retrievalPassed = false;
    let fallbackUsed = false;
    let topSimilarity = 0;
    let topMatchPreview = "";

    try {
        const embeddingResp = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });
        const queryEmbedding = embeddingResp.data[0].embedding;

        // Try RPC first
        const matches = await (async () => {
            const { data, error } = await supabase.rpc('match_chunks', {
                filter_exam_id: examId,
                match_count: 5,
                match_threshold: 0.65,
                query_embedding: queryEmbedding
            });
            if (error) throw error;
            return data;
        })().catch(async (rpcErr) => {
            console.log(`⚠️ RPC Failed (${rpcErr.message}), switching to Fallback (Client-side JS matching)...`);
            fallbackUsed = true;

            // Fallback: Fetch all chunks and match locally
            const { data: allChunks, error: fetchErr } = await supabase
                .from(CONFIG.DB_TABLE_CHUNKS)
                .select('content, embedding, exam_id')
                .eq('exam_id', examId)
                .not('embedding', 'is', null);

            if (fetchErr || !allChunks) {
                report(`❌ Fallback fetch error: ${fetchErr?.message}`);
                return [];
            }

            const scored = allChunks.map(c => {
                let vec = c.embedding;
                if (typeof vec === 'string') vec = JSON.parse(vec);
                return {
                    ...c,
                    similarity: cosineSimilarity(queryEmbedding, vec)
                };
            });

            return scored
                .filter(c => c.similarity >= 0.65)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 5);
        });

        if (matches && matches.length > 0) {
            topSimilarity = matches[0].similarity;
            topMatchPreview = matches[0].content.substring(0, 100).replace(/\n/g, ' ');

            report(`✅ Found ${matches.length} matches${fallbackUsed ? ' (via Fallback)' : ' (via RPC)'}.`);
            report(`- Top Match: "${topMatchPreview.replace(/"/g, '')}..."`);
            report(`- Similarity: ${topSimilarity.toFixed(4)}`);
            retrievalPassed = true;
        } else {
            report("⚠️ No matches found (threshold 0.65).");
        }
    } catch (e: any) {
        report(`❌ Retrieval Error: ${e.message}`);
    }
    report("");

    report("## 5. Final Result");
    // Pass if DB has content AND retrieval worked (either RPC or Fallback)
    const isPass = docCount! > 0 && chunkCount! > 0 && retrievalPassed;

    if (isPass) {
        report("✅ ESITO FINALE: PASS");
        console.log("✅ INGESTION VALIDATION PASS - STEP 2B CHIUSO");
    } else {
        report("❌ ESITO FINALE: FAIL");
        console.error("❌ VALIDATION FAILED");
    }

    if (fallbackUsed) {
        report("\n> ⚠️ Note: Retrieval used Fallback logic because RPC `match_chunks` was not found. Please apply the SQL patch (packages/ingestion/supa-rpc.sql).");
    }

    // Write Report
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, reportLines.join('\n'));
    console.log(`📄 Report generated: ${REPORT_PATH}`);
}

// --- Helpers ---
function splitByHeadings(text: string): string[] {
    return text.split(/(?=\n#{1,3}\s)/g).map(s => s.trim()).filter(s => s.length > 0);
}

function chunkText(text: string, size: number, overlap: number): string[] {
    if (text.length <= size) return [text];
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        let end = start + size;
        if (end >= text.length) {
            chunks.push(text.slice(start));
            break;
        }
        let cutPoint = text.lastIndexOf(' ', end);
        if (cutPoint <= start) cutPoint = end;
        chunks.push(text.slice(start, cutPoint));
        start = cutPoint - overlap;
        if (start <= cutPoint - size) start = cutPoint + 1;
    }
    return chunks;
}

main().catch(err => {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
});
