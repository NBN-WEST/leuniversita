---
id: AGT-INDEX
title: Agents Index
owner: Antigravity
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [agents, index]
related: [INDEX]
source_of_truth: true
mermaid: required
---

# Agents

Questa sezione contiene le specifiche canoniche per gli Agenti AI e la loro memoria runtime.

## Struttura
- `_runtime_memory.md`: Log unificato delle attività e del contesto corrente.
- `[AGENT_NAME].md`: Specifica del ruolo, tools e regole per ogni agente.

## Interaction Map
```mermaid
graph TD
    User -->|Interaction| Orch[ORCHESTRATOR_PM]
    Orch -->|Delegates| Dev[FULLSTACK_ARCHITECT]
    Orch -->|Delegates| QA[TEST_AUTOMATION_QA]
    
    subgraph Memory
        Orch -.->|Read/Write| Runtime[_runtime_memory.md]
    end
```
