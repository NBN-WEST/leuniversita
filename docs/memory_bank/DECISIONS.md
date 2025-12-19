# Decision Records

## Format
- **Decision**: [Title]
- **Date**: [YYYY-MM-DD]
- **Status**: [Proposed/Accepted/Deprecated]
- **Context**: 
- **Decision**: 
- **Consequences**: 

---

### ADR-001: Tech Stack Selection
- **Status**: Accepted
- **Date**: 2025-12-18
- **Context**: Need a rapid MVP development environment with robust backend capabilities and AI integration.
- **Decision**: Use **Next.js** (Frontend), **Supabase** (Backend/Auth/DB), and **OpenAI** (LLM).
- **Consequences**: Fast iteration, serverless scalability, but vendor lock-in with Supabase.

### ADR-002: Vector Search Engine
- **Status**: Accepted
- **Date**: 2025-12-18
- **Context**: RAG implementation requires efficient similarity search.
- **Decision**: Use **pgvector** within Supabase Postgres.
- **Consequences**: Keeps data and vectors in the same place, simplifying queries and consistency. Avoiding separate vector DBs (Pinecone, Weaviate) reduces complexity.

### ADR-003: Ingestion Pipeline Strategy
- **Status**: Accepted
- **Date**: 2025-12-18
- **Context**: Processing PDF documents for the knowledge base.
- **Decision**: Custom TypeScript ingestion scripts (`packages/ingestion`) running locally or via CI, rather than an external ETL service.
- **Consequences**: Full control over chunking and embedding logic. Requires maintenance of the ingestion scripts.

### ADR-004: Memory Bank Procedure
- **Status**: Accepted
- **Date**: 2025-12-19
- **Context**: Need to maintain project context and documentation across agent sessions.
- **Decision**: Implement a **Memory Bank** (docs/memory_bank) with automated scripts to capture task logs and architecture updates.
- **Consequences**: Adds a step to the workflow but ensures long-term alignement and automatic documentation generation.

### ADR-005: Diagnostic Engine Architecture
- **Status**: Accepted
- **Date**: 2025-12-19
- **Context**: Requirement to implement a diagnostic test with Skill Map and Study Plan generation for the MVP.
- **Decision**: Authenticate and persist attempts in Supabase (`diagnostic_attempts`, `questions`, `answers`). Logic resides entirely in Supabase Edge Functions (`diagnostic-*`) to protect prompts and grading logic.
- **Consequences**: 
  - Grading is secure (server-side).
  - Data is persistent (allows progress tracking).
  - Citations are enforced by the Backend before being sent to the client.

### ADR-006: UX Contracts & API Standards
- **Status**: Accepted
- **Date**: 2025-12-19
- **Context**: To ensure the "Le Università" MVP is usable and robust, we need strict agreements between Frontend (UX) and Backend (API) and consistent error handling.
- **Decision**: 
  - Define UI behaviors in JSON "Contracts" (`docs/ux/contracts/`).
  - Implement a "Standard Response Envelope" for all APIs: `{ data?, error?, ui_state?, ui_hints? }`.
  - Enforce Rate Limiting via `analytics_events` count.
- **Consequences**: 
  - Frontend implementation is decoupled from Backend logic (driven by JSON).
  - API errors are predictable (`error_code`).
  - System is protected against abuse (Rate Limits).

### ADR-007: Adaptive Learning (Soft)
- **Status**: Accepted
- **Date**: 2025-12-19
- **Context**: Users need to see progress without volatile score swings that destroy motivation after one bad test.
- **Decision**: 
  - Separate `learning_progress` (State) from `diagnostic_attempts` (Events).
  - Use a **Soft Update Rule**: `NewScore = (OldScore * 0.8) + (SessionScore * 0.2)`.
  - Trend indicator ('improving', 'stable') guides UX messages.
- **Consequences**: 
  - Progress bars move slowly but steadily.
  - Requires persistent tracking of every topic indefinitely.
  - Study Plans are "refined" not "reset", preserving user agency.

### ADR-008: Multi-Exam Architecture
- **Status**: Accepted
- **Date**: 2025-12-19
- **Context**: The MVP initially supported only "Diritto Privato". To scale, we need to support N exams without code duplication.
- **Decision**: 
  - Introduce `exams` table (`id` PK, `title`, `is_active`).
  - Partition all data (Sources, Progress, Attempts) by `exam_id`.
  - Refactor Ingestion to scan `docs/sources/{exam_id}` folders.
- **Consequences**: 
  - Application logic remains generic; content drives the experience.
  - Adding a new exam only requires adding a folder in sources and a row in DB.
  - Strict data isolation between exams is enforced at API/DB level.

### ADR-009: Pilot Program Design
- **Status**: Accepted
- **Date**: 2025-12-19
- **Context**: Moving from MVP development to institutional adoption requires a structured proposal, not just code. Universities need clarity on "Value", "Control", and "Metrics".
- **Decision**: 
  - establish a **"Pilot Kit"** standard (`docs/pilot/`) containing non-technical value propositions and KPI models.
  - Position the tool as an "Institutional AI Tutor" (verified sources) vs "Generalist AI".
  - Define success metrics (Adoption, Retention, Mastery) *before* deployment.
- **Consequences**: 
  - Technical development is driven by these KPIs (need for analytics).
  - Sales/Partnership conversations are grounded in pedagogical value, not just technology.
