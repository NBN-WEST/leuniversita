---
id: LRN-DIAG
title: Diagnostic Model
owner: Instructional Designer
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [learning, diagnostic, placement]
related: [LRN-INDEX]
source_of_truth: docs/memory_bank/LEARNING_ENGINE
mermaid: required
---

# Diagnostic Model

Il test d'ingresso per valutare il livello iniziale dello studente.

## Skill Mapping
Ogni domanda del test diagnostico è taggata con:
- **Topic**: Il modulo di riferimento (es. Contratti).
- **Competency**: Il Learning Objective (es. Distinguere Nullità vs Annullabilità).
- **Difficulty**: Facile / Medio / Difficile.

## Decision Tree
```mermaid
graph TD
    START[Start Diagnostic] --> Q1{Set 1: Basic concepts}
    
    Q1 -- < 50% --> LOW[Level: Novice]
    Q1 -- > 50% --> Q2{Set 2: Intermediate}
    
    Q2 -- < 60% --> MED[Level: Beginner]
    Q2 -- > 60% --> Q3{Set 3: Advanced}
    
    Q3 -- < 70% --> ADV[Level: Intermediate]
    Q3 -- > 70% --> EXP[Level: Advanced]
    
    LOW --> PATH1[Path: Full Foundation]
    MED --> PATH2[Path: Reinforced]
    ADV --> PATH3[Path: Standard]
    EXP --> PATH4[Path: Fast Track]
```

## Matrix: Score -> Path
| Score Range | Livello Assegnato | Configurazione Percorso |
|-------------|-------------------|-------------------------|
| 0-40% | **Novice** | Tutti i moduli obbligatori + Materiale extra. |
| 41-65% | **Beginner** | Tutti i moduli obbligatori. |
| 66-85% | **Intermediate** | Moduli base opzionali (se superati nel test). |
| 86-100% | **Advanced** | Accesso diretto alle simulazioni d'esame. |
