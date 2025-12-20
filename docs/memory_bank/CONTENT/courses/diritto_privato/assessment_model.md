---
id: CRS-PRIV-ASS
title: Assessment Model
owner: Exames Officer
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [course, assessment, testing]
related: [CRS-PRIV-README]
source_of_truth: docs/memory_bank/CONTENT
mermaid: required
---

# Assessment Model

Come valutiamo la preparazione dello studente.

## Flusso di Valutazione
```mermaid
sequenceDiagram
    participant Student
    participant Diagnostic
    participant Formative
    participant Summative
    
    Student->>Diagnostic: Quiz Ingresso (Test 0)
    Diagnostic-->>Student: Skill Map Iniziale
    
    loop Per Ogni Modulo
        Student->>Formative: Quiz Fine Lezione
        Formative-->>Student: Feedback Immediato
    end
    
    Student->>Summative: Simulazione Esame Finale
    Summative-->>Student: Voto in 30esimi (Predetto)
```

## Tipologie Test
1.  **Diagnostico**: 30 domande a risposta multipla, copre tutto il programma in modo superficiale. Identifica lacune macro.
2.  **Formativo**: Domande specifiche post-topic. Serve a fissare i concetti. Errore = Spiegazione immediata.
3.  **Sommativo**: Simulazione reale. Tempo limitato, niente aiuti.
