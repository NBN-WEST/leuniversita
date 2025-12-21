---
id: ADR-005
title: Schema V2 Parallel Strategy
owner: Tech Lead
status: accepted
created_at: 2025-12-21
updated_at: 2025-12-21
deciders: [Tech Lead, Architect]
context: |
  We are introducing a V2 Schema (Catalog + Tracking) while V1 (Diagnostic MVP) tables (`diagnostic_attempts`, `diagnostic_questions`, `learning_progress`) already exist.
  We need to deploy V2 without breaking existing V1 functionality or data.
decision: |
  We will adopt a "V2 Parallel" strategy.
  1. **New Tables**: All V2 Catalog tables (`courses`, `modules`, etc.) are new and don't conflict.
  2. **Renaming**: V2 Tracking tables will be explicitly named to avoid collision.
     - `learning_progress` (V1) -> `learning_progress_v2` (V2).
     - `attempts` -> `learning_attempts` (V2) vs `diagnostic_attempts` (V1).
     - `plans` -> `learning_plans` (V2).
  3. **No Migration of Data**: V1 data stays in V1 tables. V2 starts fresh.
  4. **API**: New APIs will exclusively read/write V2 tables.
consequences: |
  - Clean separation of concerns.
  - No risk of breaking V1 demos.
  - Need to update V2 Migration file to use `learning_progress_v2`.
mermaid: required
---

# Schema Strategy Visualization

```mermaid
graph TD
    subgraph V1_Legacy
        DA[diagnostic_attempts]
        DQ[diagnostic_questions]
        LP1[learning_progress]
    end
    
    subgraph V2_New
        CAT[Catalog: courses/modules]
        LP2[learning_progress_v2]
        LA[learning_attempts]
        PLAN[learning_plans]
    end
    
    V1_Legacy -.-x V2_New
    style V2_New fill:#bfb,stroke:#090,stroke-width:2px
```
