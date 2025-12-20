---
id: ADR-000
title: Adozione Memory Bank v2
owner: Antigravity
status: approved
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [architecture, standard, documentation]
related: []
source_of_truth: true
mermaid: required
---

# Adozione Memory Bank v2

## Cosa
Formalizzazione della struttura `docs/memory_bank` come unica **Single Source of Truth** per il progetto. Introduzione di Mermaid diagram obbligatori e metadata YAML standard.

## Perché
La documentazione dispersa o puramente testuale diventa rapidamente obsoleta e difficile da navigare. I diagrammi architetturali e di processo sono essenziali per mantenere l'allineamento tra agenti e sviluppatori umani.

## Come
Ogni file deve risiedere in cartelle specifiche (`AGENTS`, `ARCHITECTURE`, `DECISIONS`, `PROCESSES`, `PRODUCT`, `CONTENT`) e seguire il template standard.

### Diagramma
```mermaid
graph TD
    User([User]) -->|Updates| MB[Memory Bank]
    MB -->|Context| Agents[AI Agents]
    MB -->|Rules| CI[CI/CD Validation]
    
    subgraph Structure
        MB --> I[INDEX.md]
        I --> A[ARCHITECTURE]
        I --> P[PROCESSES]
        I --> D[DECISIONS]
        I --> PR[PRODUCT]
    end
```

## Output / Deliverables
- Cartella `docs/memory_bank` strutturata.
- Script di validazione in CI.
- Diagrammi navigabili su GitHub.
