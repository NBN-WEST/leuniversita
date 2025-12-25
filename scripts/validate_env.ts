

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// To use chalk in script via ts-node, we might need ESM or older version. 
// Standard console is safer for no-dependency or use simple patterns.
// We'll stick to standard console to avoid 'chalk' import issues if not installed.

const REQUIRED_VARS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    // 'SUPABASE_SERVICE_ROLE_KEY' // Only needed for DB scripts, not Next.js runtime usually
];

console.log("🔍 Validating Environment Variables...");

// Try loading .env
// Try loading .env from root or apps/pilot-web
const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/pilot-web/.env.local'),
    path.resolve(process.cwd(), 'apps/pilot-web/.env')
];

let servicesEnvFound = false;

for (const p of envPaths) {
    if (fs.existsSync(p)) {
        console.log(`Loading env from: ${p}`);
        dotenv.config({ path: p });
        servicesEnvFound = true;
    }
}
// Next.js loads envs automatically, but this script runs standalone.

const missing = [];

for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
        missing.push(key);
    }
}

if (missing.length > 0) {
    console.error(`❌ Missing Environment Variables:`);
    missing.forEach(k => console.error(`   - ${k}`));
    console.error(`\nPlease check .env or Vercel Settings.`);
    process.exit(1);
}

console.log(`✅ All ${REQUIRED_VARS.length} required variables are present.`);
process.exit(0);
