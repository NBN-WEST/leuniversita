#!/bin/bash
set -e

# MEMORY_BANK Wrapper
# Usage: ./scripts/memory_bank.sh [args]

echo "🏦 Initializing MEMORY_BANK..."

# Ensure we are in root (resolve symlinks)
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/.."

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
if git remote get-url origin > /dev/null 2>&1; then
    echo "🚀 Pushing changes..."
    git push
    git push --tags
else
    echo "⚠️  No remote 'origin' found. Skipping push."
    echo "👉 Run 'git remote add origin <url>' and 'git push -u origin main' manually."
fi

echo "🎉 MEMORY_BANK Process Complete."
