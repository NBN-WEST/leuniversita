import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { handleOptions, successResponse, errorResponse } from "../_shared/responseUtils.ts";

Deno.serve(async (req) => {
    const optRes = handleOptions(req);
    if (optRes) return optRes;

    try {
        const { courseId } = await req.json(); // V2 input

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get User from Auth Header (JWT)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return errorResponse({ error_code: 'UNAUTHORIZED', message: 'Missing Authorization header' }, 401);
        }
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
            return errorResponse({ error_code: 'UNAUTHORIZED', message: 'Invalid Token' }, 401);
        }
        const userId = user.id;

        // 0. Resolve Slug to UUID (if needed)
        let resolvedCourseId = courseId;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(courseId)) {
            const { data: course, error: cError } = await supabase
                .from('courses')
                .select('id')
                .eq('slug', courseId)
                .single();

            if (cError || !course) {
                return errorResponse({ error_code: 'COURSE_NOT_FOUND', message: `Course not found: ${courseId}` }, 404);
            }
            resolvedCourseId = course.id;
        }

        // 1. Fetch Diagnostic Assessment
        const { data: assessment, error: assError } = await supabase
            .from('assessments_v2')
            .select('id, settings')
            .eq('course_id', resolvedCourseId)
            .eq('type', 'diagnostic')
            .single();

        if (assError || !assessment) {
            return errorResponse({ error_code: 'NOT_FOUND', message: 'Diagnostic Assessment not found for this course.' }, 404);
        }

        // 2. Create Attempt (V2 Table)
        const { data: attempt, error: attError } = await supabase
            .from('learning_attempts_v2')
            .insert({
                user_id: userId,
                assessment_id: assessment.id,
                status: 'in_progress',
                score: null
            })
            .select()
            .single();

        if (attError) {
            console.error('Attempt Error', attError);
            return errorResponse({
                error_code: 'DB_ERROR',
                message: 'Failed to create attempt',
                details: attError
            }, 500);
        }

        // 3. Fetch Questions & Options
        const { data: questions, error: qError } = await supabase
            .from('questions_v2')
            .select(`
                id, 
                prompt, 
                difficulty,
                question_options_v2 ( id, label )
            `)
            .eq('assessment_id', assessment.id);

        if (qError) {
            console.error('Questions Error', qError);
            return errorResponse({ error_code: 'DB_ERROR', message: 'Failed to fetch questions' }, 500);
        }

        // 4. Return Standard V2 Response
        // Remap question_options_v2 to question_options payload property for frontend compatibility
        const mappedQuestions = questions?.map(q => ({
            ...q,
            question_options: q.question_options_v2
        }));

        return successResponse({
            attemptId: attempt.id,
            assessmentId: assessment.id,
            questions: mappedQuestions || []
        });

    } catch (error) {
        return errorResponse({ error_code: 'INTERNAL_ERROR', message: error.message }, 500);
    }
});
