#!/bin/bash

# Ensure we are in the project root
cd "$(dirname "$0")/.."

PROJECT_REF="ggynfvaibntlhzvsfdet"
ENV_FILE="packages/ingestion/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found."
  exit 1
fi

echo "Setting secrets on Supabase project $PROJECT_REF..."
# Use dotenvx to load env and pass to supabase secrets set
# We construct the secrets string dynamically
npx dotenvx run -f "$ENV_FILE" -- sh -c 'npx supabase secrets set --project-ref "$PROJECT_REF" OPENAI_API_KEY="$OPENAI_API_KEY" SUPABASE_URL="$SUPABASE_URL" SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"'

echo "Deploying Function 'chat'..."
# Deploy doesn't strictly need env vars injected into the process, but we run it inside to be safe
npx supabase functions deploy chat --project-ref "$PROJECT_REF"

echo "Done. You can now run: npx ts-node scripts/test_chat_edge.ts"
