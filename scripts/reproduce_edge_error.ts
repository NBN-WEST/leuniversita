import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const functionUrl = 'https://ggynfvaibntlhzvsfdet.supabase.co/functions/v1/diagnostic-submit';

async function reproduce() {
    // 1. Get Token via Magic Link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: 'admin@nbn-west.com'
    });

    if (linkError || !linkData.properties?.action_link) {
        console.error("Link Error", linkError);
        return;
    }

    const actionLink = linkData.properties.action_link;
    // Extract token query param
    const tokenMatch = actionLink.match(/token=([^&]+)/);
    if (!tokenMatch) {
        console.error("Could not parse token from link:", actionLink);
        return;
    }
    const otpToken = tokenMatch[1];

    // Exchange OTP for Session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
        token: otpToken,
        type: 'magiclink',
        email: 'admin@nbn-west.com'
    });

    if (sessionError || !sessionData.session) {
        console.error("Session Exchange Error", sessionError);
        return;
    }

    const token = sessionData.session.access_token;
    console.log("Got valid session token. Calling function...");

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
