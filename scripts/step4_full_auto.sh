#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/packages/ingestion/.env"
REPORT_FILE="$REPO_ROOT/docs/reports/step4_validation.md"

echo "🚀 Starting Step 4 Automation (Multi-Exam)..."

if [ -f "$ENV_FILE" ]; then
    while IFS='=' read -r key value; do
        if [[ $key =~ ^[^#]*$ ]] && [[ -n $key ]]; then
            export "$key=$value"
        fi
    done < "$ENV_FILE"
fi

echo "🕵️ Running Isolation Tests..."
export SUPABASE_URL="$SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

OUTPUT=$(npx ts-node scripts/test_step4_multiexam.ts 2>&1)
EXIT_CODE=$?

echo "$OUTPUT"

echo "# Step 4: Multi-Exam Validation Report" > "$REPORT_FILE"
echo "**Date**: $(date)" >> "$REPORT_FILE"
echo "**Status**: $( [ $EXIT_CODE -eq 0 ] && echo 'PASS' || echo 'FAIL' )" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "$OUTPUT" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ STEP 4 COMPLETED AND VALIDATED"
else
    echo "❌ STEP 4 FAILED"
    exit 1
fi
