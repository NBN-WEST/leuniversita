import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'apps/pilot-web/.env.local');
const config = dotenv.config({ path: envPath }).parsed || {};

const key = config.SUPABASE_SERVICE_ROLE_KEY;
if (!key) {
    console.error("Key not found in .env.local");
    process.exit(1);
}

const cmd = `npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="${key}" --project-ref ggynfvaibntlhzvsfdet`;
console.log("Running secrets set...");

exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) console.error(`Stderr: ${stderr}`);
    console.log(`Stdout: ${stdout}`);
});
