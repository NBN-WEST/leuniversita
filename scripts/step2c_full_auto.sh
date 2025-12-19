#!/bin/bash
set -e

# Configuration
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/packages/ingestion/.env"
PROJECT_REF="ggynfvaibntlhzvsfdet"
REPORT_FILE="$REPO_ROOT/docs/reports/step2c_chat_validation.md"

echo "🚀 Starting Step 2C Automation..."

# 1. Load Environment
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found."
    exit 1
fi

# 1. Load Environment securely
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found."
    exit 1
fi

echo "📂 Loading environment from $ENV_FILE..."
# Safely extract keys
export OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' "$ENV_FILE" | cut -d '=' -f2-)
export SUPABASE_URL=$(grep '^SUPABASE_URL=' "$ENV_FILE" | cut -d '=' -f2-)
export SUPABASE_SERVICE_ROLE_KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d '=' -f2-)

# Trim whitespace if any
OPENAI_API_KEY=$(echo "$OPENAI_API_KEY" | xargs)
SUPABASE_URL=$(echo "$SUPABASE_URL" | xargs)
SUPABASE_SERVICE_ROLE_KEY=$(echo "$SUPABASE_SERVICE_ROLE_KEY" | xargs)

# 2. Set Secrets
echo "🔐 Setting secrets on Supabase..."
npx -y supabase secrets set --project-ref "$PROJECT_REF" \
    OPENAI_API_KEY="$OPENAI_API_KEY" \
    SUPABASE_URL="$SUPABASE_URL" \
    SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" > /dev/null

# 3. Deploy Function
echo "☁️ Deploying 'chat' function..."
npx -y supabase functions deploy chat --project-ref "$PROJECT_REF" --no-verify-jwt

# 4. Run Verification
CHAT_EDGE_URL="${SUPABASE_URL}/functions/v1/chat"
echo "🕵️ Running Remote Verification against: $CHAT_EDGE_URL"

# Capture output
OUTPUT=$(CHAT_EDGE_URL="$CHAT_EDGE_URL" npx ts-node "$REPO_ROOT/scripts/test_chat_edge.ts" 2>&1)
EXIT_CODE=$?

# 5. Generate Report
echo "📄 Generating Report at $REPORT_FILE..."
mkdir -p "$(dirname "$REPORT_FILE")"

cat <<EOF > "$REPORT_FILE"
# Step 2C: Edge Function Chat Validation Report
**Date**: $(date)
**Endpoint**: \`$CHAT_EDGE_URL\`

## Test Output
\`\`\`
$OUTPUT
\`\`\`

## Result
EOF

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ PASS" >> "$REPORT_FILE"
    echo "✅ STEP 2C COMPLETED AND VALIDATED"
else
    echo "❌ FAIL" >> "$REPORT_FILE"
    echo "❌ Validation Failed. See report for details."
    exit 1
fi
