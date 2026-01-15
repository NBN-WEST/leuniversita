---
id: AGT-MEMORY
title: Agent Runtime Memory
owner: Orchestrator
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [memory, runtime, log]
related: [AGT-INDEX]
source_of_truth: true
mermaid: required
---

# Agent Runtime Memory

Questo file funge da "memoria a breve termine" condivisa per tutti gli agenti attivi.
Qui vengono registrati i progressi dei task correnti, i blocchi e le note volatili.

## Memory Flow
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Planning : New Request
    Planning --> Execution : Plan Approved
    Execution --> Verification : Code Written
    Verification --> Execution : Bug Found
    Verification --> Idle : Task Done
```

## Current Context
- **Active Task**: Phase 13 - Skill Map & Exam Selector
- **Phase**: Multi-Exam & Personalization
- **Last Action**: Added Skill Map page with exam selector and cross-exam summary.

## Task History (Last 5)
- **v0.16.2**: (HANDOVER) Transitioned project operations to Cursor.
- **v0.10.2**: (DEV_TOOLS) Added run_server global command.
- **v0.10.1**: (DEV_SNAPSHOT) Update pilot-web and add validation script.
- **v0.10.0**: (MB_V2_UPGRADE) Upgrade to Memory Bank v2.
