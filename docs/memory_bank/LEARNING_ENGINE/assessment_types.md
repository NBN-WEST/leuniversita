---
id: LRN-ASS-TYPES
title: Assessment Types
owner: Instructional Designer
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [learning, assessment, taxonomy]
related: [LRN-INDEX]
source_of_truth: docs/memory_bank/LEARNING_ENGINE
mermaid: required
---

# Assessment Types Taxonomy

Tipologie di valutazione supportate.

## 1. Diagnostic (Placement)
- **Quando**: Inizio corso.
- **Scopo**: Definire il punto di partenza.
- **Formato**: Multipla scelta, ampia copertura, bassa profondità.
- **Impatto**: Configura il percorso (Adaptive).

## 2. Formative (Learning)
- **Quando**: Durante il modulo (end of topic).
- **Scopo**: Rinforzo e verifica comprensione immediata.
- **Formato**: Quiz brevi, Casi pratici guidati.
- **Impatto**: Feedback immediato, sblocco unità successiva.

## 3. Summative (Certification)
- **Quando**: Fine corso / Pre-esame.
- **Scopo**: Validazione competenza finale.
- **Formato**: Simulazione esame reale (tempo limitato, domande complesse).
- **Impatto**: Score finale, previsione voto esame.

## Lifecycle Diagram
```mermaid
stateDiagram-v2
    [*] --> DIAGNOSTIC
    
    DIAGNOSTIC --> FORMATIVE : Start Learning
    
    state "Formative Loop" as F_LOOP {
        FORMATIVE --> FEEDBACK
        FEEDBACK --> RETRY
        RETRY --> FORMATIVE
        FEEDBACK --> PASS
    }
    
    PASS --> SUMMATIVE : Course Complete
    SUMMATIVE --> CERTIFIED : Score > Threshold
    SUMMATIVE --> REVIEW : Score < Threshold
    REVIEW --> F_LOOP : Review Weak Topics
```
