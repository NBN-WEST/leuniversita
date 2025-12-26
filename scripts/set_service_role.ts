import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
const config = dotenv.config({ path: envPath }).parsed || {};

const key = config.SUPABASE_SERVICE_ROLE_KEY;
if (!key) {
    console.error("Key not found");
    process.exit(1);
}

// Rename secret to SERVICE_ROLE to avoid "SUPABASE_" prefix restriction
const cmd = `npx supabase secrets set SERVICE_ROLE="${key}" --project-ref ggynfvaibntlhzvsfdet`;

exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    console.log(`Stdout: ${stdout}`);
});
