# Ingestion Pipeline Runbook

## Overview
This runbook describes how to run the ingestion pipeline for the "Le Università" MVP. The pipeline reads markdown files, chunks them, generates embeddings, and attempts to insert them into Supabase.

## Prerequisites
- Node.js installed
- Supabase project set up with `documents` and `chunks` tables.
- `.env` file in `packages/ingestion/.env` with:
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `OPENAI_API_KEY`
- `docs/sources/diritto-privato/sources.json` populated.

## Execution
Run the following command from the project root:

```bash
npx dotenvx run -f packages/ingestion/.env -- npx ts-node packages/ingestion/src/run.ts
```

If ESM issues occur, try:
```bash
npx dotenvx run -f packages/ingestion/.env -- npx ts-node --esm packages/ingestion/src/run.ts
```

## Troubleshooting
- **Sources file not found**: Ensure `docs/sources/diritto-privato/sources.json` exists and the path logic in `run.ts` resolves correctly (it uses `REPO_ROOT` relative to `src/config.ts`).
- **File not found**: Check the paths inside `sources.json`. They should be relative to the repository root (e.g., `docs/sources/...`).
- **Duplicate key**: The script checks by `exam_id` + `title`. If you need to re-ingest, manually delete the rows in Supabase or update the script to delete-before-insert.
- **OpenAI Error**: Check your API Key and quota.

## Verification Queries (Supabase SQL Editor)

### Check Documents
```sql
select count(*) from documents where exam_id='diritto-privato';
```

### Check Chunks
```sql
select count(*) from chunks where exam_id='diritto-privato';
```

### Check Visibility Breakdown
```sql
select visibility, count(*) from chunks where exam_id='diritto-privato' group by visibility;
```
