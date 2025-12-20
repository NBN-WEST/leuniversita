---
id: PROC-REVIEW
title: Memory Review Routine
owner: PM/Architect
status: approved
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [maintenance, cleanup, quality]
related: [ADR-000]
source_of_truth: true
mermaid: required
---

# Routine di Revisione Memoria

## Cosa
Un checkpoint settimanale (o post-milestone) per verificare la salute della `MEMORY_BANK`.

## Perché
La documentazione tende ad accumulare "debito tecnico" (file non aggiornati, link rotti, decisioni superate). Una pulizia regolare previene il degrado del contesto.

## Come
1.  **Run Validation**: Eseguire script di validazione.
2.  **Check Index**: Verificare che `INDEX.md` rifletta la realtà.
3.  **Deprecate**: Spostare o marcare come `status: deprecated` i file obsoleti.
4.  **Consolidate**: Unire appunti sparsi in documenti architetturali.

### Diagramma di Flusso
```mermaid
graph TD
    Start(Start Review) --> Valid{Validation Script}
    Valid -- Fail --> Fix[Fix Formatting]
    Valid -- Pass --> Content[Check Content]
    Content --> Deprecate[Mark Deprecated]
    Content --> Update[Update Index]
    Update --> End(End Routine)
```

## Output / Deliverables
- `INDEX.md` aggiornato.
- File obsoleti rimossi o archiviati.
- Report di validazione verde.
