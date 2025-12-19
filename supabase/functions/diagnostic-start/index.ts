import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import OpenAI from "https://esm.sh/openai@4.24.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const { exam_id = 'diritto-privato' } = await req.json();

        // Init clients
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

        if (!supabaseUrl || !supabaseKey || !openaiKey) {
            throw new Error("Missing Environment Variables");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const openai = new OpenAI({ apiKey: openaiKey });

        // 1. Create Attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('diagnostic_attempts')
            .insert({
                exam_id,
                status: 'in_progress',
                total_score: 0,
                skill_map: {},
                meta: {}
            })
            .select()
            .single();

        if (attemptError) throw new Error(`Failed to create attempt: ${attemptError.message}`);

        // 2. Fetch Context (Public Chunks)
        const { data: chunks, error: chunksError } = await supabase
            .from('chunks')
            .select('id, content, documents!inner(title, source_url)')
            .eq('exam_id', exam_id)
            .eq('visibility', 'public')
            .limit(40);

        if (chunksError) throw new Error(`Failed to fetch chunks: ${chunksError.message}`);
        if (!chunks || chunks.length === 0) throw new Error("No public chunks found for diagnostic generation.");

        // Randomize
        const shuffled = chunks.sort(() => 0.5 - Math.random()).slice(0, 10);

        // 3. Generate Questions (GPT-4o)
        const systemPrompt = `
You are an expert Professor of Private Law using the Socratic method.
Generate a Diagnostic Test.
Create exactly 3 Multiple Choice Questions (MCQ) and 2 Open Ended Questions (OPEN).
Use ONLY the provided Source Material.
For each question, you MUST provide a valid citation.
If you cannot find public sources for a topic, do not invent them.

Output JSON format:
{
  "questions": [
    {
      "topic": "Specific Topic",
      "difficulty": 1-5,
      "type": "MCQ" (or "OPEN"),
      "prompt": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"], // null for OPEN
      "correct_answer": "Option A" (or proper explanation for OPEN), 
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
            throw new Error("AI failed to generate questions.");
        }

        // 4. Persist Questions
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

        // Insert and select NON-SENSITIVE fields to return
        const { data: insertedQuestions, error: insertError } = await supabase
            .from('diagnostic_questions')
            .insert(questionsToInsert)
            .select('id, type, prompt, options, citations, topic, difficulty');

        if (insertError) throw new Error(`Failed to insert questions: ${insertError.message}`);

        return new Response(
            JSON.stringify({
                attempt_id: attempt.id,
                questions: insertedQuestions
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
