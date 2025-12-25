#!/bin/bash

# Default BASE_URL to localhost if not set
BASE_URL="${BASE_URL:-http://localhost:3000}"
OUT_DIR="scripts/test/out"
mkdir -p "$OUT_DIR"

echo "🔥 Starting Remote Smoke Test - v2"
echo "Target: $BASE_URL"

# 1. Seed (Try local script for remote DB)
echo "-----------------------------------"
echo "1. Seeding Remote DB via local script..."
if npx ts-node scripts/test/seed_v2.ts; then
    echo "✅ Seed Success"
else
    echo "⚠️ Seed Failed (This is expected if Service Key is missing in .env). Proceeding..."
fi

# 2. Get Token
echo "-----------------------------------"
echo "2. Getting Auth Token..."
TOKEN=$(npx ts-node scripts/test/get_token.ts)
if [ -z "$TOKEN" ] || [ "$TOKEN" == "undefined" ]; then
    echo "❌ Failed to get token"
    exit 1
fi
echo "✅ Token acquired"

# 3. Diagnostic Start
echo "-----------------------------------"
echo "3. POST /api/diagnostic/start"
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

# 4. Diagnostic Submit
echo "-----------------------------------"
echo "4. POST /api/diagnostic/submit"
ATTEMPT_ID=$(jq -r '.attemptId' "$OUT_DIR/remote_start.json")
if [ "$ATTEMPT_ID" != "null" ]; then
    # Create simple answer payload
    # Needs valid Questions from Start response?
    # For smoke, we just want to see if the endpoint accepts the request.
    # We'll mock a simple answer.
    curl -s -X POST "$BASE_URL/api/diagnostic/submit" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"attemptId\": \"$ATTEMPT_ID\", \"answers\": []}" > "$OUT_DIR/remote_submit.json"

    # We expect success or "completed" or specific error, but 200 OK is good.
    if grep -q "score" "$OUT_DIR/remote_submit.json" || grep -q "placementLevel" "$OUT_DIR/remote_submit.json"; then
        echo "✅ Submit Success"
    else
        echo "❌ Submit Failed (No score returned)"
        cat "$OUT_DIR/remote_submit.json"
    fi
else
    echo "⚠️ Skipping Submit (No Attempt ID)"
fi

# 5. Plan Current
echo "-----------------------------------"
echo "5. GET /api/plan/current"
curl -s -X GET "$BASE_URL/api/plan/current?courseId=$COURSE_ID" \
  -H "Authorization: Bearer $TOKEN" > "$OUT_DIR/remote_plan.json"

# Check for items
if grep -q "items" "$OUT_DIR/remote_plan.json"; then
    echo "✅ Plan Success"
else
    echo "❌ Plan Failed"
    cat "$OUT_DIR/remote_plan.json"
fi

# 6. Progress
echo "-----------------------------------"
echo "6. GET /api/progress"
curl -s -X GET "$BASE_URL/api/progress" \
  -H "Authorization: Bearer $TOKEN" > "$OUT_DIR/remote_progress.json"

if grep -q "stats" "$OUT_DIR/remote_progress.json"; then
    echo "✅ Progress Success"
else
    echo "❌ Progress Failed"
    cat "$OUT_DIR/remote_progress.json"
fi

echo "-----------------------------------"
echo "🎉 Smoke Test Complete. Check $OUT_DIR for details."
