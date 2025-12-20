---
id: REP-AUDIT-001
title: Repo Memory Audit
owner: Antigravity
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [audit, documentation, memory]
related: [ADR-000]
source_of_truth: false
mermaid: required
---

# Repo Memory Audit

## Current State Map
Oggi la documentazione vive in tre luoghi principali, creando frammentazione.

```mermaid
graph TD
    Root --> Docs[docs/]
    Root --> Agents[agents/]
    Root --> MB[docs/memory_bank/]
    
    Docs --> R1(runbook-ingestion.md)
    Docs --> U1(ux/)
    Docs --> S1(sources/)
    
    Agents --> A1(8 Agent Specs)
    Agents --> AM(memory/)
    
    MB --> Canon[Canonical Docs]
    
    style Docs fill:#ff9999
    style Agents fill:#ff9999
    style MB fill:#99ff99
```

## Duplicazioni e Conflitti
1.  **Ingestion Runbook**: `docs/runbook-ingestion.md` esiste fuori, mentre `docs/memory_bank/PROCESSES/ingestion.md` è il nuovo canonico.
2.  **Agent Specs**: Le specifiche (`ORCHESTRATOR_PM.md`, ecc.) sono in `agents/`, fuori dal Memory Bank.
3.  **Agent Memory**: `agents/memory/` contiene contesto che dovrebbe stare in `docs/memory_bank/AGENTS/`.

## Link Rotti (INDEX.md)
- `AGENTS/` -> Cartella non esiste ancora.
- `PRODUCT/` -> Cartella non esiste ancora.
- `CONTENT/` -> Cartella non esiste ancora.

## Piano di Azione (Phase 1)
1.  **Struttura**: Creare cartelle mancanti.
2.  **Migrazione Agenti**: Portare le specifiche in `docs/memory_bank/AGENTS` con Mermaid.
3.  **Unificazone Memoria**: Creare `AGENTS/_runtime_memory.md` per loggare i task.
4.  **Runbook Normalization**: Deprecare `docs/runbook-ingestion.md` in favore del Process canonico.

## Target State
```mermaid
graph TD
    Root --> MB[docs/memory_bank/]
    
    MB --> IDX(INDEX.md)
    MB --> AGT[AGENTS]
    MB --> PRO[PROCESSES]
    
    AGT --> A1(Orchestrator Spec)
    AGT --> A2(Runtime Memory)
    
    PRO --> P1(Ingestion Process)
```
