---
id: LRN-PROG
title: Progression Logic
owner: Tech Lead
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [learning, progression, state_machine]
related: [LRN-INDEX]
source_of_truth: docs/memory_bank/LEARNING_ENGINE
mermaid: required
---

# Progression Logic

La macchina a stati che governa lo stato di ogni modulo per lo studente.

## Stati del Modulo
1.  **LOCKED**: Non accessibile (prerequisiti non soddisfatti).
2.  **AVAILABLE**: Accessibile, mai iniziato.
3.  **IN_PROGRESS**: Iniziato, non finito.
4.  **COMPLETED**: Tutti i requisiti soddisfatti (Quiz superati).
5.  **MASTERED**: Superato con eccellenza (> 90%).

## State Machine Diagram
```mermaid
stateDiagram-v2
    [*] --> LOCKED
    
    LOCKED --> AVAILABLE : Prerequisiti OK
    AVAILABLE --> IN_PROGRESS : Start Unit
    
    IN_PROGRESS --> COMPLETED : Pass Threshold (>60%)
    IN_PROGRESS --> IN_PROGRESS : Fail (<60%)
    
    COMPLETED --> MASTERED : Perfect Score / Review
    COMPLETED --> AVAILABLE : Next Module Unlocks
    
    MASTERED --> [*]
```

## Failure Handling
- **Strike System**: Dopo 3 tentativi falliti sullo stesso quiz:
  1.  Blocco temporaneo (Cooldown 10m).
  2.  Obbligo di rilettura materiale.
  3.  Flag "Needs Help" per eventuale tutor umano (futuro).
