import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const functionUrl = 'https://ggynfvaibntlhzvsfdet.supabase.co/functions/v1/diagnostic-submit';

async function reproduce() {
    const userId = 'c3da3a9f-5562-4fac-ad7d-beb81132c492';
    const tempPass = 'DebugPass123!';

    // 1. Reset Password
    console.log("Resetting password...");
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: tempPass
    });

    if (updateError) {
        console.error("Update User Error", updateError);
        return;
    }

    // 2. Sign In
    console.log("Signing in...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@nbn-west.com',
        password: tempPass
    });

    if (signInError || !signInData.session) {
        console.error("Sign In Error", signInError);
        return;
    }

    const token = signInData.session.access_token;
    console.log("Got token. Calling function...");

    const attemptId = '9802c9f9-3d70-4457-9ea7-6a25411460eb';
    const answers = [{ questionId: 'q1', selectedOptionId: 'o1' }];

    const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ attemptId, answers })
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
}

reproduce();
