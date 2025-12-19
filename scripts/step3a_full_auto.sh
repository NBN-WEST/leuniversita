#!/bin/bash
set -e

# Configuration
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/packages/ingestion/.env"
PROJECT_REF="ggynfvaibntlhzvsfdet"
REPORT_FILE="$REPO_ROOT/docs/reports/step3a_validation.md"

echo "🚀 Starting Step 3A Automation (UX & API Hardening)..."

# 1. Load Env
if [ -f "$ENV_FILE" ]; then
    echo "📂 Loading environment safely..."
    while IFS='=' read -r key value; do
        # regex to skip comments and empty lines
        if [[ $key =~ ^[^#]*$ ]] && [[ -n $key ]]; then
            export "$key=$value"
        fi
    done < "$ENV_FILE"
else
    echo "❌ .env file not found at $ENV_FILE"
    exit 1
fi

# 2. Deploy Functions (Force update)
echo "☁️ Deploying Diagnostic Functions (Step 3A)..."
npx -y supabase functions deploy diagnostic-start --project-ref "$PROJECT_REF" --no-verify-jwt
npx -y supabase functions deploy diagnostic-submit --project-ref "$PROJECT_REF" --no-verify-jwt
npx -y supabase functions deploy study-plan --project-ref "$PROJECT_REF" --no-verify-jwt

# 3. Run Verification
echo "🕵️ Running UX & API Verification Test..."

# Run Deno test script
# Need to pass env vars to Deno
export SUPABASE_URL="$SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

OUTPUT=$(npx ts-node scripts/test_step3a_ux.ts 2>&1)
EXIT_CODE=$?

echo "$OUTPUT"

# 4. Generate Report
echo "# Step 3A: UX & API Validation Report" > "$REPORT_FILE"
echo "**Date**: $(date)" >> "$REPORT_FILE"
echo "**Status**: $( [ $EXIT_CODE -eq 0 ] && echo 'PASS' || echo 'FAIL' )" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Test Log" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "$OUTPUT" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Verification Criteria" >> "$REPORT_FILE"
echo "- UX Contracts (ui_state, ui_hints): CHECKED" >> "$REPORT_FILE"
echo "- Standard API Errors: CHECKED" >> "$REPORT_FILE"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ STEP 3A COMPLETED AND VALIDATED"
else
    echo "❌ STEP 3A FAILED"
    exit 1
fi
