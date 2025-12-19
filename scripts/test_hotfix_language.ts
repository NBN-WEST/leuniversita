
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), 'packages/ingestion/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const FUNCTIONS_BASE = `${supabaseUrl}/functions/v1`;

const ENGLISH_STOPWORDS = ["Choose", "Which of the following", "Answer:", "Question:", "True", "False", "Explain", "Activity"];

function containsEnglish(text: string): boolean {
    if (!text) return false;
    for (const word of ENGLISH_STOPWORDS) {
        if (text.includes(word)) return true;
    }
    return false;
}

async function testFunction(name: string, payload: any) {
    console.log(`Testing ${name}...`);
    const { data, error } = await supabase.functions.invoke(name, {
        body: payload
    });

    if (error) {
        console.error(`❌ ${name} Failed:`, error);
        return false;
    }

    // Check Meta
    if (data.meta?.language !== 'it') {
        console.error(`❌ ${name} Language Meta mismatch. Expected 'it', got '${data.meta?.language}'`);
        // We might accept undefined for now if strictly not implemented in all but we did implement.
        // Actually study-plan and adaptive returned it. diagnostic-start returned it.
        return false;
    }

    // Check Content
    const jsonStr = JSON.stringify(data);
    if (containsEnglish(jsonStr)) {
        console.error(`❌ ${name} contains English stopwords!`);
        console.log("Snippet:", jsonStr.substring(0, 500));
        return false;
    }

    console.log(`✅ ${name} Passed (Italian enforced).`);
    return true;
}

async function main() {
    let passed = true;

    // 1. Diagnostic Start
    const diag = await testFunction('diagnostic-start', { user_id: 'test_lang_user', exam_id: 'diritto-privato' });
    if (!diag) passed = false;

    // 2. Adaptive Review (needs user with progress, or mock)
    // We can just call it, it relies on DB data. 'test_lang_user' has no data, so it might default to 'Generale'.
    const adaptive = await testFunction('adaptive-review', { user_id: 'test_lang_user', exam_id: 'diritto-privato' });
    if (!adaptive) passed = false;

    // 3. Chat
    const chat = await testFunction('chat', { question: "Cosa sono i diritti reali?" });
    if (!chat) passed = false;

    if (!passed) {
        console.error("❌ Language Policy Validation Failed");
        process.exit(1);
    } else {
        console.log("✅ All Language Tests Passed");
    }
}

main();
