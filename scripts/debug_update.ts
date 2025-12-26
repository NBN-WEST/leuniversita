import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function inspect() {
    // Try to update with Service Role to see if it works.
    // If Service Role works, then it IS an RLS issue for the authenticated user.
    const attemptId = 'f95d0060-c63f-4ece-806a-fd0522b3c50a';

    console.log("Attempting update via Service Role...");
    const { data: updateData, error: updateError } = await supabase
        .from('learning_attempts_v2')
        .update({
            // status: 'completed', // Don't actually complete it yet, just touch it
            level: 'novice' // Try to set level to see if column exists
        })
        .eq('id', attemptId)
        .select();

    if (updateError) {
        console.error("Service Role Update Failed:", updateError);
        // This confirms column missing or constraint violation
    } else {
        console.log("Service Role Update Succeeded:", updateData);
        // This confirms it's an RLS issue for the real user
    }
}

inspect();
