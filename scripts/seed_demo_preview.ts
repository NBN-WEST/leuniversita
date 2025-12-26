
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from ingestion package
dotenv.config({ path: path.resolve(process.cwd(), 'packages/ingestion/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("Missing Env Vars in packages/ingestion/.env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function ensureUser(email: string, role: string) {
    console.log(`Checking user: ${email}...`);

    // 1. Check if exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    let user = users.find(u => u.email === email);

    if (!user) {
        console.log(`Creating user ${email}...`);
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: 'password123',
            email_confirm: true,
            user_metadata: { role } // Store role in metadata for now
        });
        if (error) throw error;
        user = data.user;
    } else {
        console.log(`User ${email} exists.`);
        await supabase.auth.admin.updateUserById(user.id, {
            password: 'password123',
            user_metadata: { role }
        });
    }

    // 2. Ensure Profile exists
    const tier = role === 'admin' ? 'pilot' : 'free';

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            user_id: user.id,
            tier: tier,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (profileError) {
        console.error(`Error upserting profile for ${email}:`, profileError);
    } else {
        console.log(`Profile synced for ${email} (Tier: ${tier})`);
    }
}

async function main() {
    try {
        await ensureUser('studente1@nbn-west.com', 'student');
        await ensureUser('admin@nbn-west.com', 'admin');
        console.log("✅ Users Seeded Successfully");
    } catch (err) {
        console.error("Failed:", err);
        process.exit(1);
    }
}

main();
