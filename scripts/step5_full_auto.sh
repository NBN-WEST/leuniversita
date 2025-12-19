#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/packages/ingestion/.env"
PROJECT_REF="ggynfvaibntlhzvsfdet"
REPORT_FILE="$REPO_ROOT/docs/reports/step5_validation.md"

echo "🚀 Starting Step 5 Automation (Monetization)..."

if [ -f "$ENV_FILE" ]; then
    while IFS='=' read -r key value; do
        if [[ $key =~ ^[^#]*$ ]] && [[ -n $key ]]; then
            export "$key=$value"
        fi
    done < "$ENV_FILE"
fi

echo "☁️ Deploying Rate Logic..."
npx -y supabase functions deploy diagnostic-start --project-ref "$PROJECT_REF" --no-verify-jwt
# Note: rateLimit.ts is shared, so deploying one function that uses it updates the bundle logic for that function.
# Ideally we deploy all, but for verification diagnostic-start is key.

echo "🕵️ Running Monetization Tests..."
export SUPABASE_URL="$SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

OUTPUT=$(npx ts-node scripts/test_step5_monetization.ts 2>&1)
EXIT_CODE=$?

echo "$OUTPUT"

echo "# Step 5: Monetization Validation Report" > "$REPORT_FILE"
echo "**Date**: $(date)" >> "$REPORT_FILE"
echo "**Status**: $( [ $EXIT_CODE -eq 0 ] && echo 'PASS' || echo 'FAIL' )" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "$OUTPUT" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ STEP 5 COMPLETED AND VALIDATED"
else
    echo "❌ STEP 5 FAILED"
    exit 1
fi
