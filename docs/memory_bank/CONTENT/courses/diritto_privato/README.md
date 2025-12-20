---
id: CRS-PRIV-README
title: Corso Diritto Privato
owner: Faculty Lead
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [course, diritto_privato, mvp]
related: [PRD-MPV, CNT-INDEX]
source_of_truth: docs/memory_bank/CONTENT
mermaid: required
---

# Diritto Privato (MVP)

Il corso pilota per il lancio di "Le Università". Copre i fondamenti essenziali richiesti al primo anno di Giurisprudenza.

## Scheda Corso
- **Livello**: Universitario (LMG-01)
- **Durata Stimata**: 12 Settimane
- **Obiettivo**: Superamento esame istituzionale.
- **Riferimento**: Manuali standard (es. Torrente-Schlesinger, Trabucchi - *riferimenti concettuali*).

## Product Alignment
Questo corso implementa l'ambito definito in [MVP Scope](../../../PRODUCT/mvp_scope.md).
Obiettivo KPI: Portare lo studente a completare i 6 moduli con accuratezza > 70%.

## Struttura Macro
```mermaid
graph LR
    C[Diritto Privato] --> M1[Fonti e Soggetti]
    C --> M2[Beni e Proprietà]
    C --> M3[Obbligazioni]
    C --> M4[Contratti]
    
    M1 --> TEST1[Test Intermedio]
    M2 --> TEST2[Test Intermedio]
    M3 --> TEST3[Test Intermedio]
    M4 --> SIM[Simulazione Esame]
```
