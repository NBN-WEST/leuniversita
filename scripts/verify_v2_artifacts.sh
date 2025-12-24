#!/bin/bash
set -e

# Define the list of required files
REQUIRED_FILES=(
  "supabase/migrations/20251221000000_schema_v2.sql"
  "supabase/migrations/20251223223000_v2_isolation.sql"
  "supabase/migrations/20251223230000_v2_plans.sql"
  "supabase/migrations/20251223232000_v2_fks_fix.sql"
  "supabase/migrations/20251223233000_v2_course_id_fix.sql"
  "supabase/migrations/20251223234000_v2_plans_fix.sql"
  "scripts/test/smoke_v2.sh"
  "scripts/test/seed_v2.ts"
  "scripts/test/get_token.ts"
  "apps/pilot-web/app/api/diagnostic/start/route.ts"
  "apps/pilot-web/app/api/diagnostic/submit/route.ts"
  "apps/pilot-web/app/api/plan/current/route.ts"
  "apps/pilot-web/app/api/progress/route.ts"
  "supabase/functions/diagnostic-start/index.ts"
  "supabase/functions/diagnostic-submit/index.ts"
)

MISSING_FILES=0

echo "🔍 Verifying V2 Artifacts..."

for FILE in "${REQUIRED_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "✅ OK: $FILE"
  else
    echo "❌ MISSING: $FILE"
    MISSING_FILES=1
  fi
done

if [ $MISSING_FILES -eq 0 ]; then
  echo "🎉 All V2 artifacts verified."
  exit 0
else
  echo "💥 Error: Missing V2 artifacts."
  exit 1
fi
