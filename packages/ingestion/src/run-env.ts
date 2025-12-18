import dotenv from 'dotenv';
import path from 'path';
import { spawn } from 'child_process';

// 1. Load .env with absolute path
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error(`❌ Failed to load .env from ${envPath}`);
    process.exit(1);
}

// 2. Check ENV
const requiredKeys = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY'];
const missingKeys = requiredKeys.filter(key => !process.env[key]);

if (missingKeys.length > 0) {
    console.error(`❌ Missing ENV keys: ${missingKeys.join(', ')}`);
    process.exit(1);
}

console.log("✅ ENV Check: PASS");
console.log(`📂 Loaded env from: ${envPath}`);

// 3. Launch run.ts
const runScriptPath = path.resolve(__dirname, 'run.ts');
console.log(`🚀 Launching ingestion script: ${runScriptPath}`);

const child = spawn('npx', ['ts-node', runScriptPath], {
    stdio: 'inherit',
    env: process.env // Pass loaded env
});

child.on('close', (code) => {
    console.log(`🏁 Ingestion process exited with code ${code}`);
    process.exit(code ?? 1);
});
