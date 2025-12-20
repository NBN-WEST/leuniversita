---
id: LRN-AI
title: AI Role & Boundaries
owner: AI Engineer
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [learning, ai, boundaries]
related: [LRN-INDEX]
source_of_truth: docs/memory_bank/LEARNING_ENGINE
mermaid: required
---

# AI Role & Boundaries

Cosa FA e cosa NON FA l'AI nel processo didattico.

## 1. Cosa FA l'AI
- **Spiegazione**: Risponde a domande sul contenuto (RAG).
- **Generazione Quiz**: Crea domande basate sui chunk di testo (Review Umana richiesta per i Sommativi).
- **Feedback Formativo**: Spiega perché una risposta è sbagliata.
- **Supporto**: Suggerisce approfondimenti.

## 2. Cosa NON FA l'AI
- **Valutazione Sommativa**: Non assegna voti d'esame "a sentimento". Il voto è calcolato deterministicamente (risposte corrette/totale).
- **Certificazione**: Non certifica il superamento del corso (lo fa la logica di progressione).
- **Invenzione**: Non inventa leggi o sentenze (Strict RAG).

## Decision Boundary Diagram
```mermaid
graph TD
    REQ[Richiesta Studente] --> CLASS{Classificatore}
    
    CLASS -- "Spiegami X" --> RAG[AI Tutor (RAG)]
    CLASS -- "Dammi il voto" --> LOGIC[Deterministic Engine]
    CLASS -- "Posso passare?" --> PROG[Progression Rules]
    
    RAG --> RESP[Risposta Generativa]
    LOGIC --> SCORE[Score Calcolato]
    PROG --> STATE[Stato Modulo]
    
    style LOGIC fill:#f9f,stroke:#333
    style PROG fill:#f9f,stroke:#333
    style RAG fill:#bbf,stroke:#333
```
