import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import OpenAI from "https://esm.sh/openai@4.24.1";
import { handleOptions, successResponse, errorResponse } from "../_shared/responseUtils.ts";

Deno.serve(async (req) => {
    const optRes = handleOptions(req);
    if (optRes) return optRes;

    try {
        const { user_id, current_plan } = await req.json();

        if (!user_id) return errorResponse({ error_code: 'INVALID_INPUT', message: 'Missing user_id' }, 400);

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });

        // 1. Get Progress
        const { data: progress } = await supabase
            .from('learning_progress')
            .select('topic, mastery_score')
            .eq('user_id', user_id)
            .lt('mastery_score', 60); // Strict threshold for replanning

        const focusTopics = progress?.map(p => p.topic).join(", ") || "General Review";

        // 2. AI Refine
        // We pass the old plan and ask to tweak it.
        const systemPrompt = `
You are an Adaptive Learning Engine.
Current Plan: ${JSON.stringify(current_plan || "None")}.
Student Weak Points: ${focusTopics}.

Task: Generate (or Refine) a 7-Day Study Plan.
- Use "Spaced Repetition": Schedule weak topics on Day 1, Day 3, Day 7.
- Keep existing strong topics but reduce their volume.
- Output JSON: { "days": [...] }
        `.trim();

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: systemPrompt }],
            response_format: { type: "json_object" }
        });

        const newPlan = JSON.parse(completion.choices[0].message.content || "{}");

        return successResponse({
            plan: newPlan.days || newPlan.study_plan || newPlan,
            ui_hints: { message: "Plan adapted to your latest progress." }
        });

    } catch (e) {
        return errorResponse({ error_code: 'INTERNAL_ERROR', message: e.message }, 500);
    }
});
