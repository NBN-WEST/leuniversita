---
id: PRD-INDEX
title: Product Index
owner: PM
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [product, index, root]
related: [INDEX]
source_of_truth: true
mermaid: required
---

# Product Memory Bank

Questa sezione contiene la **Single Source of Truth** per la visione, la roadmap e i requisiti del prodotto "Le Università".
Nessuna specifica di prodotto deve esistere fuori da questa cartella.

## Mappa Documentale
```mermaid
graph TD
    ROOT[PRODUCT] --> README(README.md)
    README --> VIS(vision.md)
    README --> MVP(mvp_scope.md)
    README --> ROAD(roadmap.md)
    README --> BACK(backlog.md)
    README --> KPI(kpi.md)

    VIS -->|Defines| MVP
    MVP -->|Feeds| ROAD
    ROAD -->|Prioritizes| BACK
    BACK -->|Impacts| KPI

    style README fill:#f9f,stroke:#333
```

## Indice dei File
| File | Scopo |
|------|-------|
| [`vision.md`](./vision.md) | Il "Perché" e il "Per chi". Problema, Soluzione e Valore. |
| [`mvp_scope.md`](./mvp_scope.md) | Il "Cosa" (e cosa no). Confini esatti dell'MVP. |
| [`roadmap.md`](./roadmap.md) | Il "Quando". Timeline macroscopica e fasi. |
| [`backlog.md`](./backlog.md) | Il "Dettaglio". Epiche e Storie prioritarie. |
| [`kpi.md`](./kpi.md) | Il "Successo". Metriche da monitorare. |
