---
id: CRS-PRIV-MAP
title: Mappa del Corso
owner: Instructional Designer
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [course, map, path]
related: [CRS-PRIV-README]
source_of_truth: true
mermaid: required
---

# Course Map: Diritto Privato

Progressione logica degli argomenti.

## Learning Path
```mermaid
graph TD
    START((Inizio)) --> FONTI[01. Fonti del Diritto]
    
    FONTI --> DIR_SOG[02. Diritti Soggettivi]
    DIR_SOG --> SOGG[03. Soggetti del Diritto]
    
    SOGG --> BENI[04. Beni e Proprietà]
    
    BENI --> OBBL[05. Obbligazioni]
    
    OBBL --> CONTR[06. Contratti]
    
    CONTR --> END((Fine MVP))
    
    style START fill:#dfd
    style END fill:#fdd
```

## Prerequisiti
- **02. Diritti Soggettivi** richiede concetti di *Capacità Giuridica* (03). (Nota: Spesso studiati in parallelo).
- **06. Contratti** richiede padronanza assoluta di **05. Obbligazioni**.
