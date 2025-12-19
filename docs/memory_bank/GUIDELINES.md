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
