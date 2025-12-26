#!/bin/bash

# Default BASE_URL to Vercel production
BASE_URL="${BASE_URL:-https://leuniversita.vercel.app}"
OUT_DIR="scripts/test/out"
mkdir -p "$OUT_DIR"

echo "🔥 Starting Remote Smoke Test - Vercel"
echo "Target: $BASE_URL"

# 0. Health Check (Vercel Connectivity)
echo "-----------------------------------"
echo "0. Checking /api/health..."
curl -s -I "$BASE_URL/api/health" > "$OUT_DIR/health_head.txt"
if grep -q "200" "$OUT_DIR/health_head.txt"; then
    echo "✅ Health Check Passed (API Reachable)"
else
    echo "❌ Health Check Failed (API Not Reachable/404)"
    cat "$OUT_DIR/health_head.txt"
    # Proceed anyway to see full failure
fi

# 1. Get Token
echo "-----------------------------------"
echo "1. Getting Auth Token..."
# We reuse the local get_token.ts which uses Supabase Service Key to sign/get a user token.
# This works regardless of where the frontend is, as long as the DB is the same.
TOKEN=$(npx ts-node scripts/test/get_token.ts | tail -n 1)
if [ -z "$TOKEN" ] || [ "$TOKEN" == "undefined" ]; then
    echo "❌ Failed to get token"
    exit 1
fi
echo "✅ Token acquired"

# 2. Start
echo "-----------------------------------"
echo "2. POST /api/diagnostic/start"
# Use Diritto Privato Course ID
COURSE_ID="d7515f48-0d00-4824-a745-f09d30058e5f"
curl -s -X POST "$BASE_URL/api/diagnostic/start" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\": \"$COURSE_ID\"}" > "$OUT_DIR/remote_start.json"

if grep -q "attemptId" "$OUT_DIR/remote_start.json"; then
    echo "✅ Start Success"
else
    echo "❌ Start Failed"
    cat "$OUT_DIR/remote_start.json"
fi

# 3. Submit
echo "-----------------------------------"
echo "3. POST /api/diagnostic/submit"
ATTEMPT_ID=$(jq -r '.attemptId' "$OUT_DIR/remote_start.json")
if [ "$ATTEMPT_ID" != "null" ] && [ "$ATTEMPT_ID" != "" ]; then
    # Mock answers
    curl -s -X POST "$BASE_URL/api/diagnostic/submit" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"attemptId\": \"$ATTEMPT_ID\", \"answers\": []}" > "$OUT_DIR/remote_submit.json"

    if grep -q "score" "$OUT_DIR/remote_submit.json" || grep -q "placementLevel" "$OUT_DIR/remote_submit.json"; then
        echo "✅ Submit Success"
    else
        echo "❌ Submit Failed"
        cat "$OUT_DIR/remote_submit.json"
    fi
else
    echo "⚠️ Skipping Submit (No Attempt ID)"
fi

# 4. Plan
echo "-----------------------------------"
echo "4. GET /api/plan/current"
curl -s -X GET "$BASE_URL/api/plan/current?courseId=$COURSE_ID" \
  -H "Authorization: Bearer $TOKEN" > "$OUT_DIR/remote_plan.json"

if grep -q "items" "$OUT_DIR/remote_plan.json"; then
    echo "✅ Plan Success"
    
    # Advanced Node check for titles presence
    node -e '
        const fs = require("fs");
        const data = JSON.parse(fs.readFileSync("'$OUT_DIR'/remote_plan.json", "utf8"));
        const missingTitles = (data.items || []).filter(i => !i.modules || !i.modules.title || i.modules.title.trim() === "");
        if (missingTitles.length > 0) {
            console.log("   ⚠️  WARNING: " + missingTitles.length + " modules missing titles!");
            console.log("   First missing ID: " + missingTitles[0].module_id);
        } else {
            console.log("   - All modules have valid titles (V2 Fix Verified)");
        }
    '
else
    echo "❌ Plan Failed"
    cat "$OUT_DIR/remote_plan.json"
fi

# 5. Progress
echo "-----------------------------------"
echo "5. GET /api/progress"
curl -s -X GET "$BASE_URL/api/progress" \
  -H "Authorization: Bearer $TOKEN" > "$OUT_DIR/remote_progress.json"

if grep -q "modules" "$OUT_DIR/remote_progress.json"; then
    echo "✅ Progress Success"
else
    echo "❌ Progress Failed"
    cat "$OUT_DIR/remote_progress.json"
fi

# 6. Attempt Persistence Check
echo "-----------------------------------"
echo "6. Checking Persistence (Via DB / Attempt API if available)"
# We can't query DB directly easily in a bash script without psql or supabase-js cli properly configured.
# We will check if we can fetch the results using the new /api/attempt endpoint if deployed.

if [ "$ATTEMPT_ID" != "null" ] && [ "$ATTEMPT_ID" != "" ]; then
    curl -s -X GET "$BASE_URL/api/attempt/$ATTEMPT_ID" \
      -H "Authorization: Bearer $TOKEN" > "$OUT_DIR/remote_attempt.json"
    
    if grep -q "score" "$OUT_DIR/remote_attempt.json"; then
        echo "✅ Persistence Verified (API returned score)"
    else
        echo "❌ Persistence Check Failed (API Error or Empty)"
        cat "$OUT_DIR/remote_attempt.json"
    fi
fi

echo "-----------------------------------"
echo "🎉 Remote Smoke Test Complete."
