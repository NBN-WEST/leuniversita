---
id: LRN-ADAPT
title: Adaptive Rules
owner: Tech Lead & ID
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [learning, adaptive, rules]
related: [LRN-INDEX]
source_of_truth: docs/memory_bank/LEARNING_ENGINE
mermaid: required
---

# Adaptive Rules Engine

Il motore decisionale che adatta il contenuto in base allo studente.

## Regole IF/THEN

### Rule 1: Module Skip (Fast Track)
- **IF** Diagnostic Score for Topic > 85%
- **THEN** Mark Module as "Optional/Completed"
- **AND** Unlock next Module immediately.

### Rule 2: Reinforcement Trigger
- **IF** Formative Quiz Score < 60%
- **THEN** Trigger "Reinforcement Loop"
- **AND** Suggest specific reading (chunk) related to the wrong answer.
- **AND** Lock next unit until retry > 70%.

### Rule 3: Difficulty Adjustment
- **IF** 3 consecutive answers are Correct (Streak)
- **THEN** Increase next question difficulty (Easy -> Medium).
- **IF** 2 consecutive answers are Wrong
- **THEN** Decrease next question difficulty (Hard -> Medium).

## Rule Flowchart
```mermaid
flowchart TD
    INPUT[Quiz Result] --> CHECK{Score Check}
    
    CHECK -- > 85% (Diagnostic) --> SKIP[Unlock Next Module]
    
    CHECK -- < 60% (Formative) --> LOCK[Lock Next Unit]
    LOCK --> SUGGEST[Suggest Review Material]
    SUGGEST --> RETRY[Require Retry]
    
    CHECK -- 60-85% --> PASS[Standard Progression]
    PASS --> NEXT[Unlock Next Unit]
```
