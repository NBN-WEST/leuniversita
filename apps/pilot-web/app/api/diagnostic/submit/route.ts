import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Logic moved from Edge Function to Next.js API for better debugging and stability
export async function POST(request: Request) {
    console.log('Diagnostic Submit API Start');
    try {
        const payload = await request.json();
        const { attemptId, answers } = payload; // answers: { questionId, selectedOptionId }[]

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        // Use Service Role to allow scoring (access is_correct) and Plan updates
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Env Vars (URL or Service Role)');
            return NextResponse.json({
                error: 'Server Misconfiguration',
                details: 'Missing SUPABASE_SERVICE_ROLE_KEY. Please add this to Vercel Environment Variables.'
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Verify User (Optional but good practice, though Service Role writes anyway)
        const authHeader = request.headers.get('Authorization');
        let userId = null;
        if (authHeader) {
            const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
            if (user) userId = user.id;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: Invalid Token' }, { status: 401 });
        }

        if (!attemptId || !answers || !Array.isArray(answers)) {
            return NextResponse.json({ error: 'Invalid Input: Missing attemptId or answers' }, { status: 400 });
        }

        console.log(`Processing Attempt: ${attemptId} for User: ${userId}`);

        // 1. Fetch Attempt & Related Data
        const { data: attempt, error: attError } = await supabase
            .from('learning_attempts_v2')
            .select('completed_at, assessments_v2!inner(course_id)')
            .eq('id', attemptId)
            .eq('user_id', userId)
            .single();

        if (attError || !attempt) {
            console.error('Attempt Not Found:', attError);
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        if (attempt.completed_at) {
            return NextResponse.json({ error: 'Attempt already completed' }, { status: 400 });
        }

        // 2. Score Answers
        // Fetch all correct options for the questions in the answers
        // Optimization: Fetch all options for the relevant questions or just iterate (for MVP verify logic)
        // Here we iterate for simplicity matching the previous logic, or better: fetch allowlist

        let correctCount = 0;
        const answersToInsert = [];

        for (const ans of answers) {
            const { data: option } = await supabase
                .from('question_options_v2')
                .select('is_correct')
                .eq('id', ans.selectedOptionId)
                .single();

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
        console.log(`Scored: ${score}% (${correctCount}/${answers.length})`);

        // 3. Determine Level
        let level = 'novice';
        if (score > 40) level = 'beginner';
        if (score > 65) level = 'intermediate';
        if (score > 85) level = 'advanced';

        // 4. Save Answers
        const { error: ansInsError } = await supabase.from('learning_answers_v2').insert(answersToInsert);
        if (ansInsError) {
            console.error('Answers Insert Error:', ansInsError);
            throw new Error(`Failed to save answers: ${ansInsError.message}`);
        }

        // 5. Update Attempt
        const { error: updateError } = await supabase.from('learning_attempts_v2').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            score,
            max_score: 100,
            level
        }).eq('id', attemptId);

        if (updateError) {
            console.error('Attempt Update Error:', updateError);
            throw new Error(`Failed to update attempt: ${updateError.message}`);
        }

        // 6. Create or Update Plan (Upsert)
        const courseId = attempt.assessments_v2.course_id;
        console.log(`Upserting Plan for Course: ${courseId}, Level: ${level}`);

        const { data: plan, error: planError } = await supabase
            .from('learning_plans_v2')
            .upsert({
                user_id: userId,
                course_id: courseId,
                level: level,
                status: 'active',
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, course_id' }) // Explicitly target the constraint
            .select('id')
            .single();

        if (planError) {
            console.error('Plan Upsert Error:', planError);
            // Don't crash the whole response if plan fails, but log it critical
            // Actually, for consistency, maybe we should return error? 
            // Let's return error so user knows flow failed.
            throw new Error(`Failed to create plan: ${planError.message}`);
        }

        console.log('Success. Plan ID:', plan?.id);

        return NextResponse.json({
            placementLevel: level,
            score,
            planId: plan?.id,
            nextAction: '/dashboard'
        });

    } catch (error: any) {
        console.error('Route Logic Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
