import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import OpenAI from "https://esm.sh/openai@4.24.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { question, exam_id = 'diritto-privato', k = 8, threshold = 0.35, debug = false } = await req.json();

        if (!question) {
            throw new Error("Missing 'question' in request body");
        }

        // 1. Init Clients
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // Using Service Role for RAG (Private access)
        const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

        const supabase = createClient(supabaseUrl, supabaseKey);
        const openai = new OpenAI({ apiKey: openaiKey });

        // 2. Embed Query
        const embeddingResp = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: question,
        });
        const queryEmbedding = embeddingResp.data[0].embedding;

        // 3. Retrieve Chunks (RPC)
        const { data: chunks, error: rpcError } = await supabase.rpc('match_chunks', {
            filter_exam_id: exam_id,
            match_count: k,
            match_threshold: threshold,
            query_embedding: queryEmbedding
        });

        if (rpcError) throw new Error(`RPC Error: ${rpcError.message}`);

        // 4. Process Chunks (Split Public/Private)
        const publicChunks: any[] = [];
        const privateChunks: any[] = [];

        // We need document metadata for Public chunks. 
        // Optimization: Collect document IDs from public chunks and fetch titles once.
        const validChunks = chunks || [];

        for (const chunk of validChunks) {
            if (chunk.visibility === 'public') {
                publicChunks.push(chunk);
            } else {
                privateChunks.push(chunk);
            }
        }

        // 5. Enrich Public Chunks (Fetch Title/URL)
        // We need to fetch document info for citation.
        const publicDocIds = [...new Set(publicChunks.map(c => c.id))]; // Wait, RPC returns chunk ID. 
        // Does RPC return document_id? 
        // The RPC definition created in Step 2B returns: id, exam_id, visibility, content, similarity.
        // It DOES NOT return document_id. We need document_id to join with documents table.
        // FIX: We need to fetch chunk details to get document_id, OR update RPC.
        // Since we cannot easily update RPC without user intervention (validated in 2B), we will fetch details.

        // Fetch details for ALL retrieved chunks to get document_id 
        // (Optimization: fetch only for public to save time? No, might need context? No, private context just needs content).
        // Actually, let's fetch document_id for the public chunks to get the title.

        let enrichedPublicChunks: any[] = [];

        if (publicChunks.length > 0) {
            const publicChunkIds = publicChunks.map(c => c.id);
            const { data: chunkDetails, error: chunkFetchErr } = await supabase
                .from('chunks')
                .select('id, document_id, chunk_index, documents!inner(id, title, source_url)')
                .in('id', publicChunkIds);

            if (chunkFetchErr) console.error("Chunk fetch error:", chunkFetchErr);

            // Map details back
            enrichedPublicChunks = publicChunks.map(pc => {
                const detail = chunkDetails?.find(d => d.id === pc.id);
                return {
                    ...pc,
                    chunk_index: detail?.chunk_index,
                    document_title: detail?.documents?.title || "Unknown Source",
                    source_url: detail?.documents?.source_url || null
                };
            });
        }

        // 6. Guardrails & Prompting
        // Rules: 
        // - If publicChunks.length < 1 OR best public similarity < 0.45 -> Refusal

        const bestPublicSim = enrichedPublicChunks.length > 0 ? enrichedPublicChunks[0].similarity : 0;
        const insufficientPublic = enrichedPublicChunks.length < 1 || bestPublicSim < 0.45;

        let answer = "";
        let finalCitations: any[] = [];

        if (insufficientPublic) {
            answer = "Non ho abbastanza fonti pubbliche citabili per rispondere con certezza. Prova a riformulare o aggiungere fonti pubbliche.";
            finalCitations = [];
        } else {
            // Construct Prompt
            const systemMessage = `
Sei un assistente esperto in Diritto Privato. 
Usa il contesto fornito per rispondere alla domanda dell'utente.
IMPORTANTE:
1. Usa i "CHUNKS PRIVATI" come contesto per capire il concetto, ma NON CITAREE MAI direttamente fonti non pubbliche.
2. Basati principalmente sui "CHUNKS PUBBLICI".
3. Se l'informazione esiste solo nei privati e non nei pubblici, rispondi che non hai fonti pubbliche sufficienti per confermare.
4. Rispondi in italiano.
`.trim();

            let contextText = "";

            if (privateChunks.length > 0) {
                contextText += "--- CONTESTO PRIVATO (SOLO PER TUA CONOSCENZA, NON CITARE) ---\n";
                privateChunks.forEach((c, i) => {
                    contextText += `[Private-${i}] ${c.content.replace(/\n/g, ' ')}\n`;
                });
                contextText += "\n";
            }

            if (enrichedPublicChunks.length > 0) {
                contextText += "--- FONTI PUBBLICHE (CITABILI) ---\n";
                enrichedPublicChunks.forEach((c, i) => {
                    contextText += `[Public-${i}] (Fonte: ${c.document_title}): ${c.content.replace(/\n/g, ' ')}\n`;
                });
            }

            const messages = [
                { role: "system", content: systemMessage },
                { role: "user", content: `Contesto:\n${contextText}\n\nDomanda: ${question}` }
            ];

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messages as any,
                temperature: 0.1,
            });

            answer = completion.choices[0].message.content || "";

            // Map citations
            // We cite ALL used public chunks that were passed to context, OR we could ask LLM to cite specific ones.
            // For MVP, simplistic approach: cite top public chunks provided in context.
            finalCitations = enrichedPublicChunks.map(c => ({
                chunk_id: c.id,
                similarity: c.similarity,
                source_title: c.document_title,
                source_url: c.source_url,
                chunk_index: c.chunk_index,
                preview: c.content.substring(0, 100) + "..."
            }));
        }

        // 7. Response
        return new Response(
            JSON.stringify({
                exam_id,
                answer,
                citations: finalCitations,
                meta: {
                    k,
                    threshold,
                    used_chunks_total: validChunks.length,
                    used_public: enrichedPublicChunks.length,
                    used_private: privateChunks.length,
                    language: "it",
                    debug_info: debug ? { best_public_sim: bestPublicSim } : undefined
                }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
