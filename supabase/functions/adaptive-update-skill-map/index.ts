import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { handleOptions, successResponse, errorResponse } from "../_shared/responseUtils.ts";

Deno.serve(async (req) => {
    const optRes = handleOptions(req);
    if (optRes) return optRes;

    try {
        const { user_id, exam_id = 'diritto-privato', updates } = await req.json();
        // updates: [{ topic: "X", score: 100 }, ...]

        if (!user_id || !Array.isArray(updates)) {
            return errorResponse({ error_code: 'INVALID_INPUT', message: 'Missing user_id or updates array' }, 400);
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const results = [];

        for (const update of updates) {
            // 1. Get Current
            const { data: current } = await supabase
                .from('learning_progress')
                .select('*')
                .eq('user_id', user_id)
                .eq('topic', update.topic)
                .maybeSingle();

            let oldMastery = current?.mastery_score || 0;
            // Soft Update Logic: 80% old, 20% new
            // If it's the very first time, weight new more (e.g. 50/50 or 100%?)
            // For MVP: if new record, take score as is. If existing, blend.

            let newMastery = update.score;
            if (current) {
                newMastery = (oldMastery * 0.8) + (update.score * 0.2);
            }

            let trend = 'stable';
            if (newMastery > oldMastery + 2) trend = 'improving';
            if (newMastery < oldMastery - 2) trend = 'declining';

            // 2. Upsert
            const { data: saved, error } = await supabase
                .from('learning_progress')
                .upsert({
                    user_id,
                    exam_id,
                    topic: update.topic,
                    mastery_score: Math.round(newMastery),
                    trend,
                    last_reviewed: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, exam_id, topic' })
                .select()
                .single();

            if (!error) results.push(saved);
        }

        return successResponse({
            success: true,
            updated_topics: results.length,
            details: results
        });

    } catch (e) {
        return errorResponse({ error_code: 'INTERNAL_ERROR', message: e.message }, 500);
    }
});
