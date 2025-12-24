
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'packages/ingestion/.env') });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve(process.cwd(), 'scripts/test/out');

// Ensure output dir
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function getToken() {
    try {
        const output = execSync('npx ts-node scripts/test/get_token.ts').toString();
        // Regex match line starting with eyJ...
        const match = output.match(/(eyJ[a-zA-Z0-9_\-\.]+)/);
        if (!match) throw new Error("No token pattern found in output:\n" + output);
        return match[1];
    } catch (e) {
        console.error("Failed to get token:", e);
        process.exit(1);
    }
}

async function runSeed() {
    try {
        console.log("Running Seed...");
        execSync('npx ts-node scripts/test/seed_v2.ts', { stdio: 'inherit' });
    } catch (e) {
        console.error("Failed to seed");
        process.exit(1);
    }
}

async function smoke() {
    console.log(`🔥 Starting Smoke Test V2 against ${BASE_URL}`);

    // 1. Seed
    await runSeed();

    // 2. Token
    const token = await getToken();
    console.log("🔑 Token acquired.");

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 3. POST /api/diagnostic/start
    console.log("👉 POST /api/diagnostic/start");
    // Use UUID matching the Seed Script
    const courseId = 'd7515f48-0d00-4824-a745-f09d30058e5f';
    const startRes = await fetch(`${BASE_URL}/api/diagnostic/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ courseId })
    });

    if (!startRes.ok) throw new Error(`Start Failed: ${startRes.status} ${await startRes.text()}`);
    const startJson = await startRes.json() as any;
    fs.writeFileSync(path.join(OUT_DIR, 'start.json'), JSON.stringify(startJson, null, 2));

    const attemptId = startJson.attemptId;
    const questions = startJson.questions;
    if (!attemptId || !questions || !questions.length) throw new Error("Invalid Start Response");

    // 4. Submit Answers
    console.log(`👉 POST /api/diagnostic/submit (Attempt: ${attemptId})`);

    // Create dummy answers (always pick first option)
    const answers = questions.map((q: any) => ({
        questionId: q.id,
        selectedOptionId: q.question_options?.[0]?.id // Assuming API returns structure with options
    })).filter((a: any) => a.selectedOptionId); // Safe filter

    if (answers.length === 0) throw new Error("Could not parse options to answer");

    const submitRes = await fetch(`${BASE_URL}/api/diagnostic/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ attemptId, answers })
    });

    if (!submitRes.ok) throw new Error(`Submit Failed: ${submitRes.status} ${await submitRes.text()}`);
    const submitJson = await submitRes.json() as any;
    fs.writeFileSync(path.join(OUT_DIR, 'submit.json'), JSON.stringify(submitJson, null, 2));

    if (!submitJson.planId || !submitJson.placementLevel) throw new Error("Invalid Submit Response");

    // 5. GET Plan
    console.log("👉 GET /api/plan/current");
    const planRes = await fetch(`${BASE_URL}/api/plan/current?courseId=diritto-privato`, { headers });
    if (!planRes.ok) throw new Error("Plan Failed");
    const planJson = await planRes.json();
    fs.writeFileSync(path.join(OUT_DIR, 'plan.json'), JSON.stringify(planJson, null, 2));

    // 6. GET Progress
    console.log("👉 GET /api/progress");
    const progRes = await fetch(`${BASE_URL}/api/progress?courseId=diritto-privato`, { headers });
    if (!progRes.ok) throw new Error("Progress Failed");
    const progJson = await progRes.json();
    fs.writeFileSync(path.join(OUT_DIR, 'progress.json'), JSON.stringify(progJson, null, 2));

    console.log("✅ SMOKE TEST PASSED");
}

smoke().catch(e => {
    console.error("❌ FAIL:", e);
    process.exit(1);
});
