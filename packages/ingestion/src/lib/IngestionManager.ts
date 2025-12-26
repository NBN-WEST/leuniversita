import { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import crypto from 'crypto';
import matter from 'gray-matter';
import { SmartChunker } from '../chunker/SmartChunker';
import { CONFIG } from '../config';

export interface Source {
    title: string;
    local_path: string;
    visibility: 'public' | 'private';
    source_url?: string;
    license?: string;
    exam_id: string;
}

export class IngestionManager {
    private supabase: SupabaseClient;
    private openai: OpenAI;
    private chunker: SmartChunker;

    constructor(supabase: SupabaseClient, openai: OpenAI) {
        this.supabase = supabase;
        this.openai = openai;
        this.chunker = new SmartChunker();
    }

    private computeHash(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    async processDocument(source: Source): Promise<'skipped' | 'ingested' | 'error'> {
        try {
            console.log(`\n🔍 Processing: ${source.title} (${source.visibility})`);

            // 1. Read File & Compute Hash
            if (!fs.existsSync(source.local_path)) {
                console.error(`❌ File not found: ${source.local_path}`);
                return 'error';
            }
            const fileContent = fs.readFileSync(source.local_path, 'utf-8');
            const { content: markdownBody, data: frontmatter } = matter(fileContent);

            // Validate Frontmatter for Public Docs
            if (source.visibility === 'public') {
                if (!frontmatter.source_url && !source.source_url) {
                    console.error(`❌ Missing source_url for public doc: ${source.title}`);
                    return 'error';
                }
            }

            const contentHash = this.computeHash(markdownBody);

            // 2. Check Idempotency (Hash Match)
            const { data: existing } = await this.supabase
                .from(CONFIG.DB_TABLE_DOCUMENTS)
                .select('id, content_hash')
                .eq('exam_id', source.exam_id)
                .eq('title', source.title)
                .single();

            if (existing && existing.content_hash === contentHash) {
                console.log(`   ⏭️  Skipped (Unchanged Hash)`);
                return 'skipped';
            }

            // 3. Clean up old version if exists (Hash mismatch or no hash)
            if (existing) {
                console.log(`   ♻️  Content changed. Updating old version (ID: ${existing.id})...`);
                // Note: Cascading delete usually handles chunks, but we delete specifically to be safe
                // Actually Supabase usually has Cascade on Delete. verify this? 
                // Assuming Cascade. If not, we might orphan chunks. 
                // Let's delete explicitly to fail fast if DB constraints prevent it.
                await this.supabase.from(CONFIG.DB_TABLE_DOCUMENTS).delete().eq('id', existing.id);
            }

            // 4. Insert New Doc
            const { data: docInsert, error: docError } = await this.supabase
                .from(CONFIG.DB_TABLE_DOCUMENTS)
                .insert({
                    exam_id: source.exam_id,
                    title: source.title,
                    source_url: frontmatter.source_url || source.source_url || null,
                    license: frontmatter.license || source.license || null,
                    content_hash: contentHash
                })
                .select()
                .single();

            if (docError || !docInsert) {
                console.error(`❌ Failed to insert document: ${docError?.message}`);
                return 'error';
            }

            const docId = docInsert.id;

            // 5. Chunking (Smart)
            const effectiveChunkSize = source.visibility === 'public' ? 600 : CONFIG.CHUNK_SIZE; // Public docs usually simpler laws
            const effectiveOverlap = CONFIG.CHUNK_OVERLAP;

            const chunks = this.chunker.chunk(markdownBody, effectiveChunkSize, effectiveOverlap);
            let chunksInserted = 0;

            // 6. Embedding & Insertion
            // TODO: Batch embeddings to save network calls?
            // For robustness, serial is fine for now. 

            for (let i = 0; i < chunks.length; i++) {
                const chunkContent = chunks[i];

                let embedding;
                try {
                    const response = await this.openai.embeddings.create({
                        model: "text-embedding-3-small",
                        input: chunkContent,
                        encoding_format: "float",
                    });
                    embedding = response.data[0].embedding;
                } catch (e: any) {
                    console.error(`❌ OpenAI Error: ${e.message}`);
                    return 'error';
                }

                const { error: chunkError } = await this.supabase
                    .from(CONFIG.DB_TABLE_CHUNKS)
                    .insert({
                        document_id: docId,
                        exam_id: source.exam_id,
                        chunk_index: i,
                        content: chunkContent,
                        embedding: embedding,
                        visibility: source.visibility
                    });

                if (chunkError) {
                    console.error(`❌ Chunk insert error: ${chunkError.message}`);
                } else {
                    chunksInserted++;
                }
            }

            console.log(`   ✅ Ingested: ${chunks.length} chunks`);
            return 'ingested';

        } catch (error: any) {
            console.error(`❌ Critical Processing Error: ${error.message}`);
            return 'error';
        }
    }
}
