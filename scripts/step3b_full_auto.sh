#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/packages/ingestion/.env"
PROJECT_REF="ggynfvaibntlhzvsfdet"
REPORT_FILE="$REPO_ROOT/docs/reports/step3b_validation.md"

echo "🚀 Starting Step 3B Automation (Adaptive Learning)..."

if [ -f "$ENV_FILE" ]; then
    echo "📂 Loading environment..."
    while IFS='=' read -r key value; do
        if [[ $key =~ ^[^#]*$ ]] && [[ -n $key ]]; then
            export "$key=$value"
        fi
    done < "$ENV_FILE"
else
    echo "❌ .env not found"
    exit 1
fi

echo "☁️ Deploying Adaptive Functions..."
npx -y supabase functions deploy adaptive-review --project-ref "$PROJECT_REF" --no-verify-jwt
npx -y supabase functions deploy adaptive-update-skill-map --project-ref "$PROJECT_REF" --no-verify-jwt
npx -y supabase functions deploy adaptive-regenerate-plan --project-ref "$PROJECT_REF" --no-verify-jwt

echo "🕵️ Running Adaptive Verification..."
export SUPABASE_URL="$SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

OUTPUT=$(npx ts-node scripts/test_step3b_adaptive.ts 2>&1)
EXIT_CODE=$?

echo "$OUTPUT"

echo "# Step 3B: Adaptive Validation Report" > "$REPORT_FILE"
echo "**Date**: $(date)" >> "$REPORT_FILE"
echo "**Status**: $( [ $EXIT_CODE -eq 0 ] && echo 'PASS' || echo 'FAIL' )" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "$OUTPUT" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ STEP 3B COMPLETED AND VALIDATED"
else
    echo "❌ STEP 3B FAILED"
    exit 1
fi
