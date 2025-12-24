#!/bin/bash
# Smoke Test V2 Runner

echo "==== SMOKE TEST V2 ===="
echo "Target: http://localhost:3000"
echo "Ensure 'npm run dev' is running in another terminal!"
echo "======================="

# Check connectivity
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Error: localhost:3000 is not reachable."
    echo "Please start the server first."
    exit 1
fi

# Run Typescript Runner
npx ts-node scripts/test/smoke_v2.ts
