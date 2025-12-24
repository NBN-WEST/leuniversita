
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'packages/ingestion/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// We use Service Key to allow Admin login/creation without rate limits or confirmations if possible, 
// OR use it to generate a link?
// Actually simpler: just use Client with Service Key to signInWithPassword? 
// No, Service Role bypasses RLS but for Auth acts as admin.
// signInWithPassword works with ANON key usually. 
// But let's use Service Key to admin.generateLink or similar IF needed.
// Simplest: Use Service Key, check if user exists, if so signIn with password using a CLIENT (Anon key).
// We need ANON_KEY? Usually it's in env.
// If missing, we can try using Service Key for everything, but signInWithPassword might output a session linked to the user.

const anonKey = process.env.SUPABASE_ANON_KEY || serviceKey; // Fallback

if (!supabaseUrl || !serviceKey) process.exit(1);

const adminClient = createClient(supabaseUrl, serviceKey);
const authClient = createClient(supabaseUrl, anonKey!);

const email = 'studente1@nbn-west.com';
const password = 'password123';

async function main() {
    // 1. Ensure User Exists
    const { data: { users } } = await adminClient.auth.admin.listUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
        const { data, error } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        if (error) {
            console.error("Create User Error:", error.message);
            process.exit(1);
        }
        user = data.user;
    }

    // 2. Sign In
    const { data, error } = await authClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        // If password changed or wrong, try admin reset?
        console.error("Login Error:", error.message);
        process.exit(1);
    }

    if (data.session) {
        console.log(data.session.access_token);
    } else {
        console.error("No session returned");
        process.exit(1);
    }
}

main();
