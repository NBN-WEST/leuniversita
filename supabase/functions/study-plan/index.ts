import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import OpenAI from "https://esm.sh/openai@4.24.1";
import { handleOptions, successResponse, errorResponse } from "../_shared/responseUtils.ts";

Deno.serve(async (req) => {
    const optRes = handleOptions(req);
    if (optRes) return optRes;

    try {
        const { attempt_id } = await req.json();

        if (!attempt_id) {
            return errorResponse({ error_code: 'INVALID_INPUT', message: 'Missing attempt_id' }, 400);
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

        const supabase = createClient(supabaseUrl, supabaseKey);
        const openai = new OpenAI({ apiKey: openaiKey });

        // 1. Fetch Skill Map
        const { data: attempt, error } = await supabase
            .from('diagnostic_attempts')
            .select('skill_map, total_score, user_id')
            .eq('id', attempt_id)
            .single();

        if (error || !attempt) {
            return errorResponse({ error_code: 'ATTEMPT_NOT_FOUND', message: 'Attempt not found' }, 404);
        }

        const skillMap = attempt.skill_map;

        // 2. Prepare Context
        // Extract weak topics
        const weakTopics = skillMap.topics.filter((t: any) => t.score < 70);
        const allSources = skillMap.topics.flatMap((t: any) => t.recommended_sources || []);

        const systemPrompt = `
Sei un Tutor esperto. Crea un Piano di Studio di 7 Giorni per lo studente basato sui risultati del Diagnostico.
SCRIVI TUTTO IN ITALIANO.
Punteggio Totale: ${attempt.total_score}%.
Concentrati sugli Argomenti Deboli: ${weakTopics.map((t: any) => t.topic).join(", ")}.

Struttura il piano come un array JSON di giorni.
Ogni giorno deve avere:
- day: number
- focus: string (Argomento)
- activities: array di oggetti { type: "Read" | "Practice" | "Review", description: "...", source_citation: { title: "...", url: "..." } }

IMPORTANTE:
- Per le attività di lettura, DEVI fornire una citazione valida dalle Fonti fornite.
- Se nessuna fonte specifica corrisponde, raccomanda una revisione generale ma segna source come null.
`;

        const userPrompt = `Available Sources:\n${JSON.stringify(allSources.slice(0, 20))}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const plan = JSON.parse(completion.choices[0].message.content || "{}");

        // 3. Log Analytics
        await supabase.from('analytics_events').insert({
            event_name: 'studyplan_generated',
            user_id: attempt.user_id,
            properties: { attempt_id }
        });

        return successResponse({
            plan: plan.days || plan.study_plan || plan, // Normalize logic if needed
            ui_state: "plan_view",
            ui_hints: {
                view_mode: "vertical_timeline",
                export_enabled: true
            },
            meta: { language: "it" }
        });

    } catch (error) {
        return errorResponse({ error_code: 'INTERNAL_ERROR', message: error.message }, 500);
    }
});
