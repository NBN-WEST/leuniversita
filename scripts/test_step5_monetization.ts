import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "packages/ingestion/.env" });

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://ggynfvaibntlhzvsfdet.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function invokeDiagnostic(userId: string) {
    // We mock the body to ensure minimal overhead, focusing on rate limit check
    // Need to use a user_id that matches the profile we seed
    const { data, error } = await supabase.functions.invoke('diagnostic-start', {
        body: { user_id: userId, exam_id: 'diritto-privato' }
    });

    // Status 429 comes as error in some clients or data with error_code
    if (error) return { status: 500, error }; // Network/System error
    // Supabase Functions standard response if using errorResponse helper returns 4xx status
    // Client handling varies. Let's assume the response object contains status if custom client,
    // but here we get data/error. If status is returned by edge function, supabase-js might wrap it.

    // Let's rely on the returned JSON checking
    return data;
}

// Helper to direct fetch because supabase-js invoke hides status code sometimes
async function invokeRaw(userId: string) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/diagnostic-start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, exam_id: 'diritto-privato' })
    });
    const json = await res.json() as any;
    return { status: res.status, body: json };
}

async function runTests() {
    console.log("🚀 Starting Step 5 Monetization Verification...");

    const freeUser = 'test-user-free';
    const premiumUser = 'test-user-premium';

    // 1. Seed Profiles (Already seeded by migration, but ensure here)
    await supabase.from('profiles').upsert([
        { user_id: freeUser, tier: 'free' },
        { user_id: premiumUser, tier: 'premium' }
    ]);

    // 2. Clear previous events for testing
    await supabase.from('analytics_events').delete().in('user_id', [freeUser, premiumUser]);
    console.log("   ✅ Cleaned up old analytics");

    // 3. Test Free Limit (Limit is 3)
    console.log(`\n1️⃣  Testing FREE Limit (Limit: 3)...`);
    for (let i = 1; i <= 4; i++) {
        const { status, body } = await invokeRaw(freeUser);
        console.log(`   Attempt ${i}: Status ${status} - ${body.error_code || 'OK'}`);

        if (i <= 3) {
            if (status !== 200) {
                console.error("   ❌ Free user blocked prematurely!");
                process.exit(1);
            }
        } else {
            // 4th attempt should fail
            if (status === 429 && body.error_code === 'RATE_LIMIT_EXCEEDED') {
                console.log("   ✅ Free user correctly blocked on 4th attempt.");
            } else {
                console.error("   ❌ Free user NOT blocked!", status, body);
                process.exit(1);
            }
        }
    }

    // 4. Test Premium Bypass
    console.log(`\n2️⃣  Testing PREMIUM Bypass...`);
    for (let i = 1; i <= 5; i++) {
        const { status } = await invokeRaw(premiumUser);
        if (status !== 200) {
            console.error(`   ❌ Premium user blocked on attempt ${i}!`);
            process.exit(1);
        }
    }
    console.log("   ✅ Premium user exceeded free limit successfully.");

    console.log("\n✅ STEP 5 VERIFICATION PASSED");
}

runTests();
