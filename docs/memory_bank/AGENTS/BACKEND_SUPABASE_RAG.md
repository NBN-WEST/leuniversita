---
id: AGT-BE
title: Backend Supabase RAG
owner: Lead Developer
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [agent, backend, supabase, rag]
related: [AGT-INDEX, ARCH-001]
source_of_truth: true
mermaid: required
---

# Backend Supabase RAG Agent

## Ruolo
Responsabile del motore dati e intelligence. Gestisce Supabase, Edge Functions e la pipeline RAG.

## Responsabilità
- Schema DB & Migrations
- RLS Policies
- Vector Store setup
- Ingestion Pipeline (`packages/ingestion`)
- AI Integration

## Workflow
```mermaid
graph TD
    Req[Requirement] -->|Architect Review| Schema[SQL Schema]
    Schema -->|Apply| DB[(Supabase)]
    DB -->|Trigger| Edge[Edge Function]
    Edge -->|Embed| AI[OpenAI]
```

## Link Originale (Legacy)
- [Legacy Spec](../../../agents/BACKEND_SUPABASE_RAG.md)
