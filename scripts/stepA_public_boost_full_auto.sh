#!/bin/bash
set -e

# Configuration
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/packages/ingestion/.env"
REPORT_FILE="$REPO_ROOT/docs/reports/stepA_public_layer_boost.md"
PUBLIC_DOCS_DIR="$REPO_ROOT/docs/sources/diritto-privato/public"

echo "🚀 Starting Step A: Public Layer Boost..."

# 1. Check Content
if [ ! -d "$PUBLIC_DOCS_DIR" ]; then
    echo "❌ Error: Public docs directory missing."
    exit 1
fi
echo "✅ Public docs directory found."

# 2. Ingestion (Public Only)
echo "📥 Running Ingestion (Public Only)..."
# We need to run via ts-node, passing the arg to the script inside run-env? 
# run-env.ts executes run.ts. We need to pass args through.
# run-env.ts uses spawn 'ts-node' 'run.ts'. We should make sure it passes args.
# Let's bypass run-env.ts for this specific task to pass args easily, OR assume run-env passes usage.
# If run-env doesn't pass args, we should call run.ts directly but we need to load env first.
# We will use dotenvx to load env and call run.ts directly.

npx dotenvx run -f "$ENV_FILE" -- npx ts-node "$REPO_ROOT/packages/ingestion/src/run.ts" --onlyVisibility public

# 3. Verification & Report
echo "🕵️ Running Verification..."

# 3a. DB Check (via custom script or reusing validate-standalone?)
# We need to check public count >= 80.
# Let's create a quick check script inline or use a node script.
CHECK_SCRIPT="$REPO_ROOT/scripts/check_public_count.ts"
cat <<EOF > "$CHECK_SCRIPT"
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '$ENV_FILE' });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    const { count } = await supabase.from('chunks').select('*', { count: 'exact', head: true }).eq('visibility', 'public');
    const safeCount = count || 0;
    console.log(\`Public Chunks: \${safeCount}\`);
    if (safeCount < 80) {
        console.error("FAIL: Public chunks < 80");
        process.exit(1);
    }
}
check();
EOF

echo "checking DB counts..."
npx ts-node "$CHECK_SCRIPT"
DB_STATUS=$?

# 3b. Chat Test
echo "💬 Testing Chat (Remote)..."
# Load URL
CHAT_EDGE_URL=$(grep '^SUPABASE_URL=' "$ENV_FILE" | cut -d '=' -f2-)/functions/v1/chat
export CHAT_EDGE_URL

# Capture test output
TEST_OUTPUT=$(CHAT_EDGE_URL="$CHAT_EDGE_URL" npx ts-node "$REPO_ROOT/scripts/test_chat_edge.ts" 2>&1)
TEST_STATUS=$?

# 4. Generate Report
mkdir -p "$(dirname "$REPORT_FILE")"
echo "# Step A: Public Layer Boost Report" > "$REPORT_FILE"
echo "**Date**: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Public Sources Added" >> "$REPORT_FILE"
ls -1 "$PUBLIC_DOCS_DIR" | sed 's/^/- /' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## DB Counts Check" >> "$REPORT_FILE"
if [ $DB_STATUS -eq 0 ]; then echo "✅ Public Chunks >= 80" >> "$REPORT_FILE"; else echo "❌ Public Chunks < 80" >> "$REPORT_FILE"; fi
echo "" >> "$REPORT_FILE"
echo "## Chat Verification" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "$TEST_OUTPUT" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Final Result" >> "$REPORT_FILE"

if [ $DB_STATUS -eq 0 ] && [ $TEST_STATUS -eq 0 ]; then
    echo "✅ PASS" >> "$REPORT_FILE"
    echo "✅ STEP A PUBLIC LAYER BOOST COMPLETED AND VALIDATED"
else
    echo "❌ FAIL" >> "$REPORT_FILE"
    echo "❌ Validation Failed"
    exit 1
fi
