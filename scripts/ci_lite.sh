#!/bin/bash

# CI-Lite: Fast local verification
# Runs:
# 1. Build (apps/pilot-web)
# 2. Start Server
# 3. Smoke Test (Local)
# 4. Cleanup

set -e

echo "🚀 Starting CI-Lite Verification..."

# 1. Build
echo "📦 Step 1: Building apps/pilot-web..."
cd apps/pilot-web
npm run build
echo "✅ Build Successful."

# 2. Start Server
echo "🚀 Step 2: Starting Production Server..."
npm start &
SERVER_PID=$!
cd ../..

# Function to clean up server on exit
cleanup() {
    echo "🛑 Stopping Server (PID: $SERVER_PID)..."
    kill $SERVER_PID
}
trap cleanup EXIT

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
# Simple poller
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ Server is up!"
        break
    fi
    sleep 1
done

# 3. Smoke Test
echo "🔥 Step 3: Running Local Smoke Test..."
bash scripts/test/smoke_v2.sh
echo "✅ Smoke Test Passed."

echo "🎉 CI-Lite Verification Complete! You are safe to commit."
