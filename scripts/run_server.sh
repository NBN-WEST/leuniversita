#!/bin/bash
set -e

# Ensure we are in root (resolve symlinks)
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/.."

echo "🚀 Starting Le Università MVP (Pilot Web)..."
echo "📂 Project Root: $(pwd)"

# Check requirements
if [ ! -d "apps/pilot-web" ]; then
  echo "❌ Error: apps/pilot-web directory not found!"
  exit 1
fi

# Run Next.js dev server
cd apps/pilot-web
echo "🌐 Launching Next.js..."
npm run dev
