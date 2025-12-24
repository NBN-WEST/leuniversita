import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { handleOptions, successResponse, errorResponse } from "../_shared/responseUtils.ts";

Deno.serve(async (req) => {
    const optRes = handleOptions(req);
    if (optRes) return optRes;

    try {
        const { attemptId, answers } = await req.json();
        // answers: { questionId, selectedOptionId }[]

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return errorResponse({ error_code: 'UNAUTHORIZED', message: 'Missing Authorization header' }, 401);
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) return errorResponse({ error_code: 'UNAUTHORIZED', message: 'Invalid Token' }, 401);
        const userId = user.id;

        if (!attemptId || !answers || !Array.isArray(answers)) {
            return errorResponse({ error_code: 'INVALID_INPUT', message: 'Missing attemptId or answers array' }, 400);
        }

        // 1. Fetch Attempt & Related Data
        const { data: attempt, error: attError } = await supabase
            .from('learning_attempts_v2')
            .select('completed_at, assessments_v2!inner(course_id)')
            .eq('id', attemptId)
            .eq('user_id', userId)
            .single();

        if (attError || !attempt) {
            return errorResponse({ error_code: 'NOT_FOUND', message: 'Attempt not found or access denied' }, 404);
        }

        if (attempt.completed_at) {
            // Idempotency: if already scored, maybe just return previous result? 
            // For now, allow re-scoring or block. Let's block.
            return errorResponse({ error_code: 'COMPLETED', message: 'Attempt already completed' }, 400);
        }

        // 2. Fetch Correct Answers Logic
        // For MVP, simplistic loop. Ideally batch fetch.
        let correctCount = 0;
        const answersToInsert = [];

        for (const ans of answers) {
            const { data: option } = await supabase
                .from('question_options_v2')
                .select('is_correct')
                .eq('id', ans.selectedOptionId)
                .single(); // Assuming strict validation later

            const isCorrect = option?.is_correct || false;
            if (isCorrect) correctCount++;

            answersToInsert.push({
                attempt_id: attemptId,
                question_id: ans.questionId,
                selected_option_id: ans.selectedOptionId,
                is_correct: isCorrect
            });
        }

        const score = (correctCount / answers.length) * 100;

        // 3. Save Answers & Update Attempt
        const { error: ansInsError } = await supabase.from('learning_answers_v2').insert(answersToInsert);
        if (ansInsError) console.error("Ans Insert Error", ansInsError);

        await supabase.from('learning_attempts_v2').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            score
        }).eq('id', attemptId);

        // 4. Determine Level
        let level = 'novice';
        if (score > 40) level = 'beginner';
        if (score > 65) level = 'intermediate';
        if (score > 85) level = 'advanced';

        // 5. Create Plan
        const courseId = attempt.assessments_v2.course_id;
        const { data: plan, error: planError } = await supabase
            .from('learning_plans_v2')
            .insert({
                user_id: userId,
                course_id: courseId,
                level: level,
                status: 'active'
            })
            .select('id')
            .single();

        if (planError) console.error("Plan Error", planError);

        // 6. Return Result
        return successResponse({
            placementLevel: level,
            score,
            planId: plan?.id,
            nextAction: '/dashboard',
            debugError: planError
        });

    } catch (error) {
        return errorResponse({ error_code: 'INTERNAL_ERROR', message: error.message }, 500);
    }
});
