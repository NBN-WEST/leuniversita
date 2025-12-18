#!/bin/bash
set -e

# MEMORY_BANK Wrapper
# Usage: ./scripts/memory_bank.sh [args]

echo "🏦 Initializing MEMORY_BANK..."

# Ensure we are in root
cd "$(dirname "$0")/.."

# Check if ts-node is available
if ! command -v ts-node &> /dev/null; then
    echo "⚠️ ts-node not found. Using npx..."
    RUNNER="npx ts-node"
else
    RUNNER="ts-node"
fi

# Run the TypeScript logic
$RUNNER scripts/memory_bank.ts "$@"

# If successful (set -e will catch failure), Push
echo "🚀 Pushing changes..."
git push
git push --tags

echo "🎉 MEMORY_BANK Process Complete."
