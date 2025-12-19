import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import OpenAI from "https://esm.sh/openai@4.24.1";
import { handleOptions, successResponse, errorResponse } from "../_shared/responseUtils.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";

const RATE_LIMIT_QC = 10; // Allow 10 starts per day for MVP

Deno.serve(async (req) => {
    const optRes = handleOptions(req);
    if (optRes) return optRes;

    try {
        const { exam_id = 'diritto-privato', user_id = 'anon_user' } = await req.json();

        // Environment Check
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

        if (!supabaseUrl || !supabaseKey || !openaiKey) {
            return errorResponse({ error_code: 'SERVER_CONFIG_ERROR', message: 'Missing env vars' }, 500);
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const openai = new OpenAI({ apiKey: openaiKey });

        // 1. Rate Limit
        const allowed = await checkRateLimit(supabase, user_id, 'diagnostic_started', RATE_LIMIT_QC);
        if (!allowed) {
            return errorResponse({
                error_code: 'RATE_LIMIT_EXCEEDED',
                message: 'Daily diagnostic limit reached. Please try again tomorrow.'
            }, 429);
        }

        // 2. Create Attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('diagnostic_attempts')
            .insert({
                exam_id,
                user_id,
                status: 'in_progress',
                total_score: 0,
                skill_map: {},
                meta: { client_user_id: user_id }
            })
            .select()
            .single();

        if (attemptError) {
            return errorResponse({ error_code: 'DB_ERROR', message: attemptError.message }, 500);
        }

        // 3. Fetch Context (Public Chunks)
        const { data: chunks, error: chunksError } = await supabase
            .from('chunks')
            .select('id, content, documents!inner(title, source_url)')
            .eq('exam_id', exam_id)
            .eq('visibility', 'public')
            .limit(40);

        if (!chunks || chunks.length === 0) {
            return errorResponse({ error_code: 'NO_CONTENT', message: 'No reference references found.' }, 404);
        }

        // Randomize
        const shuffled = chunks.sort(() => 0.5 - Math.random()).slice(0, 10);

        // 4. Generate Questions
        const systemPrompt = `
You are an expert Professor of Private Law. Generate a Diagnostic Test.
Create exactly 3 Multiple Choice Questions (MCQ) and 2 Open Ended Questions (OPEN).
Use ONLY the provided Source Material.
For each question, you MUST provide a valid citation.

Output JSON format:
{
  "questions": [
    {
      "topic": "Specific Topic",
      "difficulty": 1-5,
      "type": "MCQ" (or "OPEN"),
      "prompt": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"], 
      "correct_answer": "Option A" (or explanation), 
      "citations": [ { "source_title": "Title", "source_url": "URL" } ]
    }
  ]
}
`.trim();

        const userPrompt = `Source Material:\n${JSON.stringify(shuffled.map(c => ({
            text: c.content.substring(0, 300),
            title: c.documents.title,
            url: c.documents.source_url
        })))}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        const questions = result.questions || [];

        if (questions.length === 0) {
            return errorResponse({ error_code: 'AI_ERROR', message: 'Question generation failed.' }, 500);
        }

        // 5. Persist Questions
        const questionsToInsert = questions.map((q: any) => ({
            attempt_id: attempt.id,
            exam_id,
            topic: q.topic,
            difficulty: q.difficulty,
            type: q.type,
            prompt: q.prompt,
            options: q.options,
            correct_answer: q.correct_answer,
            citations: q.citations
        }));

        const { data: insertedQuestions, error: insertError } = await supabase
            .from('diagnostic_questions')
            .insert(questionsToInsert)
            .select('id, type, prompt, options, citations, topic, difficulty');

        if (insertError) {
            return errorResponse({ error_code: 'DB_ERROR', message: insertError.message }, 500);
        }

        // 6. Log Analytics
        await supabase.from('analytics_events').insert({
            event_name: 'diagnostic_started',
            user_id: user_id,
            properties: { attempt_id: attempt.id, exam_id }
        });

        // 7. UX-Formatted Response
        return successResponse({
            attempt_id: attempt.id,
            questions: insertedQuestions,
            ui_state: "question_view",
            ui_hints: {
                total_questions: insertedQuestions.length,
                progress_start: 0
            }
        });

    } catch (error) {
        return errorResponse({ error_code: 'INTERNAL_ERROR', message: error.message }, 500);
    }
});
