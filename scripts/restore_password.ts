import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function restore() {
    const userId = 'c3da3a9f-5562-4fac-ad7d-beb81132c492';
    // Restore to 'admin123' as seen in logs
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: 'admin123'
    });

    if (updateError) {
        console.error("Restore Error", updateError);
    } else {
        console.log("Password restored to admin123");
    }
}

restore();
