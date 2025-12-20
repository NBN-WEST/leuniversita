---
id: PRD-KPI
title: KPIs & Metrics
owner: PM
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [product, metrics, analytics]
related: [PRD-INDEX]
source_of_truth: true
mermaid: required
---

# KPIs & Metrics

Metriche per valutare il successo del Pilot.

## North Star Metric
# **% Studenti che completano il percorso pre-esame**
(Indica valore reale percepito).

## KPI Albero
```mermaid
graph TD
    NS[North Star: Completion Rate] --> A[Activation: % Quiz Start]
    NS --> R[Retention: % Return Day 7]
    NS --> Q[Quality: % Positive Chat Feedback]
    
    Q --> Q1[Hallucination Rate < 3%]
    Q --> Q2[Latency < 2s]
```

## Metriche MVP (Target)
| Metrica | Descrizione | Target Pilot |
|---------|-------------|--------------|
| **Signups** | Numero account creati | 50 (Closed Beta) |
| **Engagement** | Msg scambiati per utente | > 20 / sessione |
| **Accuracy** | Voto medio risposta AI (1-5) | > 4.2 |
| **Performance** | Tempo risposta chat (TTFB) | < 1.5s |
