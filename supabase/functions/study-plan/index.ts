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
        const { attempt_id } = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

        const supabase = createClient(supabaseUrl, supabaseKey);
        const openai = new OpenAI({ apiKey: openaiKey });

        // 1. Fetch Skill Map
        const { data: attempt, error } = await supabase
            .from('diagnostic_attempts')
            .select('skill_map, total_score')
            .eq('id', attempt_id)
            .single();

        if (error || !attempt) throw new Error("Attempt not found");

        const skillMap = attempt.skill_map;

        // 2. Prepare Context
        // Extract weak topics
        const weakTopics = skillMap.topics.filter((t: any) => t.score < 70);
        const allSources = skillMap.topics.flatMap((t: any) => t.recommended_sources || []);

        const systemPrompt = `
You are an expert Tutor. Create a 7-Day Study Plan for the student based on their Diagnostic results.
Overall Score: ${attempt.total_score}%.
Focus heavily on the Weak Topics: ${weakTopics.map((t: any) => t.topic).join(", ")}.

Structure the plan as a JSON array of days.
Each day must have:
- day: number
- focus: string (Topic)
- activities: array of objects { type: "Read" | "Practice" | "Review", description: "...", source_citation: { title: "...", url: "..." } }

IMPORTANT:
- For "Read" activities, you MUST provide a valid citation from the provided Sources list. 
- If no specific source lines up, recommend a general review of the topic but clearly mark source as null (but try to use sources).
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

        return new Response(
            JSON.stringify(plan),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
