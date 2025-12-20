---
id: CNT-VER
title: Content Versioning
owner: Content Manager
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [content, versioning, lifecycle]
related: [CNT-INDEX]
source_of_truth: true
mermaid: required
---

# Content Versioning Lifecycle

I contenuti non sono statici. La legge cambia, i metodi di insegnamento evolvono.

## Stati del Contenuto
1.  **DRAFT**: In lavorazione, visibile solo agli editor.
2.  **REVIEW**: In attesa di approvazione legale/pedagogica.
3.  **LIVE**: Pubblicato e servito agli studenti.
4.  **DEPRECATED**: Non più valido (es. legge abrogata), mantenuto per storico.
5.  **ARCHIVED**: Rimosso dall'accesso attivo.

## Lifecycle Diagram
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> REVIEW: Submit
    REVIEW --> DRAFT: Reject/Changes Needed
    
    REVIEW --> LIVE: Approve
    LIVE --> DEPRECATED: New Regulation/Update
    LIVE --> ARCHIVED: EOL
    
    DEPRECATED --> ARCHIVED
    DEPRECATED --> DRAFT: Update & Revive
```

## Regole di Versionamento
- **Major Update (vX.0)**: Cambiamenti strutturali al corso o cambio normativa rilevante.
- **Minor Update (v0.X)**: Correzioni, aggiunta quiz, miglioramento spiegazioni.
- **Patch (v0.0.X)**: Fix typo.
