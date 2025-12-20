---
id: LRN-DATA
title: Learning Data Model
owner: Data Architect
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [learning, data, schema]
related: [LRN-INDEX]
source_of_truth: docs/memory_bank/LEARNING_ENGINE
mermaid: required
---

# Learning Data Model

Modello concettuale delle entità che supportano il Learning Engine.

## Entities
- **Student**: L'utente che apprende.
- **SkillMap**: Il profilo di competenza dello studente (Topic -> Mastery Level).
- **Attempt**: Il tentativo di superare un quiz/assessment.
- **Progress**: Lo stato di avanzamento nei moduli.

## ER Diagram (Conceptual)
```mermaid
erDiagram
    STUDENT ||--o{ PROGRESS : tracks
    STUDENT ||--o{ ATTEMPT : makes
    STUDENT ||--|| SKILL_MAP : acts_as
    
    PROGRESS {
        string module_id
        string status "LOCKED, AVAILABLE..."
        int current_unit
    }
    
    ATTEMPT {
        string assessment_id
        float score
        json answers
        timestamp created_at
    }
    
    SKILL_MAP {
        json mastery_levels "{topic_id: 0..100}"
        timestamp updated_at
    }
    
    ATTEMPT }|--|| ASSESSMENT : refers_to
    ASSESSMENT ||--|| MODULE : belongs_to
```
