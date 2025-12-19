import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import OpenAI from "https://esm.sh/openai@4.24.1";
import { handleOptions, successResponse, errorResponse } from "../_shared/responseUtils.ts";

Deno.serve(async (req) => {
    const optRes = handleOptions(req);
    if (optRes) return optRes;

    try {
        const { user_id, exam_id = 'diritto-privato' } = await req.json();

        if (!user_id) return errorResponse({ error_code: 'INVALID_INPUT', message: 'Missing user_id' }, 400);

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });

        // 1. Identify Weak Topics (Limit 2)
        const { data: progress } = await supabase
            .from('learning_progress')
            .select('topic, mastery_score')
            .eq('user_id', user_id)
            .eq('exam_id', exam_id)
            .lt('mastery_score', 70)
            .order('last_reviewed', { ascending: true }) // Review oldest first
            .limit(2);

        const weakTopics = progress?.map(p => p.topic) || [];
        // Fallback if no specific weak topics (new user or all good)
        const targetTopics = weakTopics.length > 0 ? weakTopics : ["Generale"];

        // 2. Fetch Context
        // Search chunks relevant to these topics
        const { data: chunks } = await supabase.rpc('match_documents', {
            query_embedding: [], // Reuse diagnostic-start logic logic in real app, simplified here: 
            // Ideally we need keyword search if we don't have vector.
            // For MVP, simplistic fallback: fetch random or specific if we had keyword search.
            // Let's rely on standard 'fetch chunks' without embedding for now or use dummy embedding.
            // Better: Select * from chunks where ... (Supabase doesn't support keyword search easily without TSVector).
            // WORKAROUND: Just fetch public chunks associated with exam and let LLM filter or just random.
            match_threshold: 0.5,
            match_count: 5
        });

        // Actually, for Step 3B MVP, we will reuse the vector store or just query by existing topic metadata if we had it.
        // Since chunks don't have explicit 'topic' metadata column (only embedding), we might just get random random chunks
        // OR rely on previous diagnostic questions if we stored them?
        // Let's Fetch *random* public chunks for now to simulate "General Review" if we can't vector search easily without a query.

        const { data: randomChunks } = await supabase
            .from('chunks')
            .select('content, documents!inner(title, source_url)')
            .eq('exam_id', exam_id)
            .limit(20);

        const context = randomChunks?.sort(() => 0.5 - Math.random()).slice(0, 5) || [];

        // 3. Generate Micro-Quiz (3 questions)
        const prompt = `
Generate a Micro-Review (3 Questions) for user.
Focus Topics: ${targetTopics.join(", ")}.
Use public sources.
Output JSON: { questions: [...] }
        `.trim();

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a Tutor. Generate 3 MCQ questions." },
                { role: "user", content: `Context: ${JSON.stringify(context)}\n${prompt}` }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");

        return successResponse({
            questions: result.questions || [],
            focus_topics: targetTopics,
            ui_state: "review_mode",
            ui_hints: {
                message: "Quick review session to strengthen your weak points."
            }
        });

    } catch (e) {
        return errorResponse({ error_code: 'INTERNAL_ERROR', message: e.message }, 500);
    }
});
