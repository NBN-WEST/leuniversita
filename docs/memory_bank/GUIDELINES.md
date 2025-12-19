# Project Guidelines

## Coding Standards
- Use TypeScript for all scripts and logic.
- NO secrets in code or git.
- **Supabase Edge Functions**: Use Deno runtime. Use Service Role key for backend logic, but validate inputs.

## Documentation
- Keep `docs/memory_bank` updated via the `memory_bank` script.

## Diagnostic Engine Guidelines
- **Public Citations Only**: All generated questions and study materials MUST cite public sources (e.g., Treccani, Normattiva) verified by the RAG engine. "Unknown Source" is NOT acceptable.
- **Skill Map Standard**: The Skill Map must follow the standard JSON structure defined in `ADR-005` (Topic, Score, Level, Mistakes, Recommended Sources).
- **Security**: Grading logic must reside server-side (Edge Function). Correct answers must NOT be exposed to the client in the `diagnostic-start` response.

## Adaptive Learning Guidelines (Soft)
- **Soft Updates**: Mastery scores must utilize the Weighted Moving Average formula `(Current * 0.8) + (New * 0.2)` to ensure stability.
- **Trend Tracking**: Always calculate and store `trend` ('improving', 'stable', 'declining') on every update.
- **Plan Refinement**: When regenerating study plans, prioritize "Refinement" over "Replacement" to respect previous user effort.

## Multi-Exam Guidelines
- **Data Isolation**: All operations MUST be scoped by `exam_id`. Cross-contamination of user progress between courses is strictly prohibited.
- **Ingestion**: Content MUST be ingested into `docs/sources/{exam_id}`. The root `docs/sources` folder is for configuration only.

## Monetization & Access Guidelines
- **Feature Gating**: Features must be gated server-side using `profiles.tier`. Do not rely solely on client-side checks.
- **Rate Limiting**: Use the `checkRateLimit` utility with Tier awareness.
- **UX**: When a user hits a limit, return `ui_hints` to encourage upgrade (Soft Gate) BEFORE blocking with a 429 error (Hard Gate).
