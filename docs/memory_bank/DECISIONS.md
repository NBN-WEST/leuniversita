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
