#!/bin/bash
set -e

# Configuration
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/packages/ingestion/.env"
PROJECT_REF="ggynfvaibntlhzvsfdet"
REPORT_FILE="$REPO_ROOT/docs/reports/step2d_validation.md"

echo "🚀 Starting Step 2D Automation (Diagnostic Engine)..."

# 1. Load Environment
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found."
    exit 1
fi

echo "📂 Loading environment..."
export OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' "$ENV_FILE" | cut -d '=' -f2- | xargs)
export SUPABASE_URL=$(grep '^SUPABASE_URL=' "$ENV_FILE" | cut -d '=' -f2- | xargs)
export SUPABASE_SERVICE_ROLE_KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d '=' -f2- | xargs)

# 2. Set Secrets
echo "🔐 Setting secrets on Supabase..."
npx -y supabase secrets set --project-ref "$PROJECT_REF" \
    OPENAI_API_KEY="$OPENAI_API_KEY" \
    SUPABASE_URL="$SUPABASE_URL" \
    SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" > /dev/null

# 3. Deploy Functions
echo "☁️ Deploying 'diagnostic-start'..."
npx -y supabase functions deploy diagnostic-start --project-ref "$PROJECT_REF" --no-verify-jwt

echo "☁️ Deploying 'diagnostic-submit'..."
npx -y supabase functions deploy diagnostic-submit --project-ref "$PROJECT_REF" --no-verify-jwt

echo "☁️ Deploying 'study-plan'..."
npx -y supabase functions deploy study-plan --project-ref "$PROJECT_REF" --no-verify-jwt

# 4. Run Test
echo "🕵️ Running Diagnostic Engine Tests..."
START_URL="${SUPABASE_URL}/functions/v1/diagnostic-start"
SUBMIT_URL="${SUPABASE_URL}/functions/v1/diagnostic-submit"
PLAN_URL="${SUPABASE_URL}/functions/v1/study-plan"

echo "   Endpoints: $START_URL, $SUBMIT_URL, $PLAN_URL"

# Capture output
OUTPUT=$(npx ts-node "$REPO_ROOT/scripts/test_step2d_edge.ts" 2>&1)
EXIT_CODE=$?

# 5. Generate Report
echo "📄 Generating Report at $REPORT_FILE..."
mkdir -p "$(dirname "$REPORT_FILE")"

cat <<EOF > "$REPORT_FILE"
# Step 2D: Diagnostic Engine Validation Report
**Date**: $(date)
**Status**: $(if [ $EXIT_CODE -eq 0 ]; then echo "PASS"; else echo "FAIL"; fi)

## Components Deployed
- \`diagnostic-start\`
- \`diagnostic-submit\`
- \`study-plan\`

## Test Output
\`\`\`
$OUTPUT
\`\`\`

## Notes
- Database Schema (\`diagnostic_attempts\`, etc.) must be applied for this to pass.
- Public Citations were strictly enforced.

## Result
$(if [ $EXIT_CODE -eq 0 ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi)
EOF

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ STEP 2D COMPLETED AND VALIDATED"
else
    echo "❌ Validation Failed. See report for details."
    exit 1
fi
