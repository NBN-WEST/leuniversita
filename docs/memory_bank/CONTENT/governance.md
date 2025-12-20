---
id: CNT-GOV
title: Content Governance
owner: Legal & Content
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [content, governance, legal]
related: [CNT-INDEX]
source_of_truth: true
mermaid: required
---

# Content Governance Policy

Regole inderogabili per la creazione e gestione dei contenuti.

## 1. Fonti Ammesse
- **Open Access**: Testi di legge (Gazzetta Ufficiale), Sentenze pubbliche.
- **Rielaborazioni Originali**: Sintesi prodotte internamente o dall'AI su nostra direttiva.
- **Materiale Partner**: Fornito esplicitamente dall'ateneo con licenza d'uso.

## 2. Divieti Assoluti
- ❌ Upload di manuali interi senza licenza.
- ❌ Copia-incolla massivo da siti terzi non autorizzati.
- ❌ Generazione AI non verificata da umano (Human-in-the-loop obbligatorio).

## Decision Flow
```mermaid
graph TD
    START[Nuova Fonte] --> PUB{È Pubblico Dominio?}
    PUB -- Sì --> OK[Usa Fonte]
    PUB -- No --> LIC{Abbiamo Licenza?}
    
    LIC -- Sì --> OK
    LIC -- No --> SYN{È Sintesi Originale?}
    
    SYN -- Sì --> OK
    SYN -- No --> REJECT[⛔ SCARTA FONTE]
    
    OK --> REV[Review Umana]
    REV --> PUBLISH[Pubblica nel RAG]
```
