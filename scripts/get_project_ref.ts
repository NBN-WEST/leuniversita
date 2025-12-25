import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/pilot-web/.env.local'),
    path.resolve(process.cwd(), 'apps/pilot-web/.env')
];

for (const p of envPaths) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
    }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) {
    console.error("NEXT_PUBLIC_SUPABASE_URL not found");
    process.exit(1);
}

// Extract ref from https://<ref>.supabase.co
const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
if (match && match[1]) {
    console.log(match[1]);
} else {
    console.error("Could not extract Project Ref from URL: " + url);
    process.exit(1);
}
