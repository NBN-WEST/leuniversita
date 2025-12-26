---
id: CTX-001
title: Active Context
owner: System
status: active
created_at: 2025-12-24
updated_at: 2025-12-24
tags: [context, state, focus]
source_of_truth: true
mermaid: not_applicable
---

# Active Context

## Current Focus
**Phase 5 Hardening & QA (v0.13.2)**
- **Goal**: Ensure UI robustness (Diagnostic/Results) and readiness for Vercel deployment.
- **Status**: **CODE COMPLETE** (Pending Remote Deployment).
- **Phase 11: Content Pipeline Hardening (COMPLETED)**
  - Implemented `IngestionManager` with SHA256 Idempotency.
  - Implemented `SmartChunker` (recursive splitting).
  - Created `pdf-parse` based `PDFProcessor`.
  - Created `ingest_automator.ts` for One-Command Ingestion.
  - Validated and Cleaned "Diritto Privato" dataset.

## Active Documents
- `packages/ingestion/src/lib/IngestionManager.ts` (Core Logic)
- `packages/ingestion/src/ingest_automator.ts` (Orchestrator)
- `packages/ingestion/src/chunker/SmartChunker.ts` (Text Splitting)

## Recent Changes
- **Refactor**: Split `run.ts` into modular classes.
- **Feat**: Added `content_hash` to DB for idempotency.
- **Fix**: Removed stale public duplicates of private manuals.

## Next Steps
1. Deploy Edge Functions (`supabase functions deploy diagnostic-submit`).
2. Deploy Frontend to Vercel (using `docs/deploy/vercel_supabase_checklist.md`).
3. Verify production URL.
```
