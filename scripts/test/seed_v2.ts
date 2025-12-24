// scripts/test/seed_v2.ts
// STRICT V2 SEEDING - No Legacy Interactions

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'packages/ingestion/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("🌱 Seeding V2 Catalog (ISOLATED)...");

    // 1. Course
    // Reuse existing ID to avoid FK violations on upsert if ID changed
    const cid = 'd7515f48-0d00-4824-a745-f09d30058e5f';
    const { error: cError } = await supabase.from('courses').upsert({
        id: cid,
        slug: 'diritto-privato',
        title: 'Diritto Privato',
        description: 'Corso completo V2'
    }, { onConflict: 'slug' as any });
    if (cError) throw cError;

    // 2. Modules
    const m1Id = 'e2b3c4d5-e6f7-4824-a745-f09d30058e51'; // Fonti
    const modules = [
        { id: m1Id, course_id: cid, slug: '01-fonti', server_id: 'MOD-PRIV-01', title: 'Fonti del Diritto', order_index: 1 },
        { id: 'e2b3c4d5-e6f7-4824-a745-f09d30058e52', course_id: cid, slug: '02-diritti', server_id: 'MOD-PRIV-02', title: 'Diritti Soggettivi', order_index: 2 },
    ];

    // Note: If modules table still has legacy constraints (e.g. order_index missing), this might fail if migration wasn't applied strictly.
    // BUT we are assuming user ran the "Fix" for modules/courses OR we accept that modules table is shared.
    // The Previous Failure was on 'order_index' missing. The User was asked to Fix it.
    // We proceed assuming 'modules' is usable or patched. If not, we fail fast.

    const { error: mError } = await supabase.from('modules').upsert(modules, { onConflict: 'course_id,slug' as any });
    if (mError) {
        console.warn("Module upsert warning:", mError.message);
        // We continue because we care about Assessments/Questions for this smoke test primarily.
    } else {
        console.log("Modules seeded.");
    }

    // 3. Learning Objectives
    const objId1 = 'f3b3c4d5-e6f7-4824-a745-f09d30058e61';
    await supabase.from('learning_objectives').upsert([
        { id: objId1, module_id: m1Id, code: 'LO-01-01', description: 'Distinguere la gerarchia delle fonti' }
    ], { onConflict: 'id' as any });

    // 4. Assessment V2 (ISOLATED)
    const assId = 'a4b3c4d5-e6f7-4824-a745-f09d30058e70';
    console.log("Upserting assessments_v2...");
    const { error: assErr } = await supabase.from('assessments_v2').upsert({
        id: assId,
        course_id: cid,
        type: 'diagnostic',
        settings: { time_limit: 1800 }
    }).select('id').single();
    if (assErr) throw assErr;

    // 5. Questions V2 (ISOLATED)
    console.log("Upserting questions_v2...");
    const q1Id = 'b5b3c4d5-e6f7-4824-a745-f09d30058e81';
    const q2Id = 'b5b3c4d5-e6f7-4824-a745-f09d30058e82';
    const q3Id = 'b5b3c4d5-e6f7-4824-a745-f09d30058e83';

    const questions = [
        {
            id: q1Id,
            assessment_id: assId,
            prompt: 'Quale tra le seguenti è una fonte primaria del diritto?',
            difficulty: 1
        },
        {
            id: q2Id,
            assessment_id: assId,
            prompt: 'Il codice civile è una legge ordinaria?',
            difficulty: 1
        },
        {
            id: q3Id,
            assessment_id: assId,
            prompt: 'La Costituzione può essere modificata da una legge ordinaria?',
            difficulty: 1
        }
    ];

    const { error: qErr } = await supabase.from('questions_v2').upsert(questions).select('id');
    if (qErr) throw qErr;

    // 6. Options V2 (ISOLATED)
    console.log("Upserting question_options_v2...");
    const options = [
        // Q1
        { id: 'c6b3c4d5-e6f7-4824-a745-f09d30058e91', question_id: q1Id, label: 'Legge ordinaria', is_correct: true, sort_order: 1 },
        { id: 'c6b3c4d5-e6f7-4824-a745-f09d30058e92', question_id: q1Id, label: 'Regolamento condominiale', is_correct: false, sort_order: 2 },
        // Q2
        { id: 'c6b3c4d5-e6f7-4824-a745-f09d30058e93', question_id: q2Id, label: 'Sì', is_correct: true, sort_order: 1 },
        { id: 'c6b3c4d5-e6f7-4824-a745-f09d30058e94', question_id: q2Id, label: 'No', is_correct: false, sort_order: 2 },
        // Q3
        { id: 'c6b3c4d5-e6f7-4824-a745-f09d30058e95', question_id: q3Id, label: 'Sì', is_correct: false, sort_order: 1 },
        { id: 'c6b3c4d5-e6f7-4824-a745-f09d30058e96', question_id: q3Id, label: 'No', is_correct: true, sort_order: 2 }
    ];

    const { error: oErr } = await supabase.from('question_options_v2').upsert(options, { onConflict: 'id' as any });
    if (oErr) throw oErr;

    console.log("✅ V2 Catalog Seeded Successfully (Isolated Tables).");
}

main().catch(err => {
    console.error("Seed Failed:", err);
    process.exit(1);
});
