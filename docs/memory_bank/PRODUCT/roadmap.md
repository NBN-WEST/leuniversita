---
id: PRD-ROAD
title: Product Roadmap
owner: PM
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [product, roadmap, timeline]
related: [PRD-INDEX]
source_of_truth: true
mermaid: required
---

# Product Roadmap

## Fasi Macro

### NOW (Q4 2024 - Gen 2025) - Pilot
- Focus: Stabilità tecnica e feedback qualitativo.
- Deliverable: MVP funzionante per Diritto Privato.
- Utenti: Beta tester chiusi.

### NEXT (Q1 2025) - V1 Launch
- Focus: Retention e scalabilità contenuti.
- Deliverable: Aggiunta Diritto Pubblico + Dashboard Docente.
- Utenti: Primi atenei partner.

### LATER (Q2 2025+) - Expansion
- Focus: Monetizzazione e Gamification.
- Deliverable: Premium Plan, Mobile App.

## Timeline Grafica
```mermaid
gantt
    title Roadmap 2024-2025
    dateFormat YYYY-MM
    axisFormat %b %y

    section Pilot (NOW)
    Ingestion Pipeline       :done,    p1, 2024-11, 2024-12
    RAG Engine Stability     :active,  p2, 2024-12, 2025-01
    UI Diagnostic Flow       :active,  p3, 2024-12, 2025-01

    section Launch (NEXT)
    Multi-materia            :         n1, 2025-02, 2025-03
    Teacher Dashboard        :         n2, 2025-02, 2025-04

    section Scale (LATER)
    Monetization             :         l1, 2025-04, 2025-06
    Mobile App               :         l2, 2025-05, 2025-07
```
