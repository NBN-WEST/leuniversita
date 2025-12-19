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
        const { attempt_id, answers } = await req.json();

        if (!attempt_id || !answers || !Array.isArray(answers)) {
            throw new Error("Invalid request body");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

        const supabase = createClient(supabaseUrl, supabaseKey);
        const openai = new OpenAI({ apiKey: openaiKey });

        // 1. Fetch Questions
        const { data: questions, error: qError } = await supabase
            .from('diagnostic_questions')
            .select('*')
            .eq('attempt_id', attempt_id);

        if (qError || !questions) throw new Error("Attempt not found");

        // 2. Grading
        let gradedAnswers = [];
        let skillMapData: any = {};

        for (const ans of answers) {
            const question = questions.find(q => q.id === ans.question_id);
            if (!question) continue;

            let isCorrect = false;
            let score = 0;
            let feedback = "";

            if (question.type === 'MCQ') {
                // Determine correctness by checking if user answer matches correct one
                // Assuming correct_answer is a string corresponding to the option text or index
                // For robustness, check partial match or exact match
                isCorrect = (ans.answer === question.correct_answer);
                score = isCorrect ? 1.0 : 0.0;
                feedback = isCorrect ? "Correct!" : `Incorrect. The correct answer was: ${question.correct_answer}`;
            } else {
                // OPEN Question -> LLM Grading
                const gradePrompt = `
Question: ${question.prompt}
Rubric/Correct Answer: ${JSON.stringify(question.correct_answer)}
Student Answer: ${ans.answer}

Grade this answer from 0.0 to 1.0 (float).
Provide short constructive feedback in Italian.
Output JSON: { "score": 0.5, "feedback": "..." }
`.trim();

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: gradePrompt }],
                    response_format: { type: "json_object" }
                });
                const res = JSON.parse(completion.choices[0].message.content || "{}");
                score = res.score || 0;
                feedback = res.feedback || "No feedback generated.";
                isCorrect = score >= 0.6;
            }

            gradedAnswers.push({
                attempt_id,
                question_id: question.id,
                answer: ans.answer, // JSONB
                is_correct: isCorrect,
                score,
                feedback
            });

            // Update Skill Aggregation
            const topic = question.topic || "Generale";
            if (!skillMapData[topic]) {
                skillMapData[topic] = { scoreSum: 0, count: 0, mistakes: [], citations: [] };
            }
            skillMapData[topic].scoreSum += score;
            skillMapData[topic].count += 1;

            if (score < 1.0) {
                skillMapData[topic].mistakes.push(question.prompt);
                // Collect citations for review
                if (question.citations && Array.isArray(question.citations)) {
                    skillMapData[topic].citations.push(...question.citations);
                }
            }
        }

        // 3. Construct Skill Map
        const topics = Object.keys(skillMapData).map(topic => {
            const d = skillMapData[topic];
            const avg = d.scoreSum / d.count;

            // Deduplicate citations
            const uniqueCitations = [...new Set(d.citations.map((c: any) => JSON.stringify(c)))]
                .map((s: any) => JSON.parse(s));

            return {
                topic,
                score: Math.round(avg * 100),
                level: avg > 0.8 ? 5 : avg > 0.5 ? 3 : 1,
                confidence: 1.0,
                mistakes: d.mistakes,
                recommended_sources: uniqueCitations
            };
        });

        const overall = (gradedAnswers.reduce((a, b) => a + b.score, 0) / (gradedAnswers.length || 1)) * 100;

        const finalSkillMap = {
            overall: Math.round(overall),
            topics
        };

        // 4. Update Attempt
        await supabase.from('diagnostic_attempts').update({
            status: 'completed',
            total_score: overall,
            skill_map: finalSkillMap
        }).eq('id', attempt_id);

        // 5. Insert Answers
        const { error: ansInsertError } = await supabase
            .from('diagnostic_answers')
            .insert(gradedAnswers);

        if (ansInsertError) console.error("Error saving answers:", ansInsertError);

        return new Response(
            JSON.stringify({
                success: true,
                score: overall,
                skill_map: finalSkillMap
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
