---
id: PROC-INGEST
title: Processo di Ingestione
owner: Backend Team
status: approved
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [ingestion, rag, pipeline]
related: [ADR-003]
source_of_truth: true
mermaid: required
---

# Processo di Ingestione

## Cosa
Il processo automatizzato che trasforma documenti PDF grezzi in "conoscenza" interrogabile (vettori) nel database.

## Perché
Per garantire che il RAG risponda sempre con dati freschi, validati e correttamente citabili, senza intervento manuale eccessivo.

## Come
Lo script legge dai path configurati, parsa il contenuto, lo divide in chunk semantici, calcola gli embedding tramite OpenAI e salva su Supabase.

### Diagramma di Flusso
```mermaid
flowchart LR
    PDF[PDF Source] -->|Parse| TXT[Raw Text]
    TXT -->|Chunk| CHK[Chunks]
    CHK -->|Embed| VEC[Vectors]
    VEC -->|Store| DB[(Supabase)]
    
    subgraph Quality Gate
        TXT -- Check --> Metadata[Metadati OK?]
        Metadata -- No --> Error[Log Error]
    end
```

### Sequence Diagram
```mermaid
sequenceDiagram
    participant S as Script
    participant P as Parser
    participant O as OpenAI
    participant D as DB
    
    S->>P: Read PDF
    P-->>S: Return Text + Meta
    S->>S: Split into Chunks
    loop For each Chunk
        S->>O: Get Embedding
        O-->>S: Vector
        S->>D: Upsert (Vector + Content)
    end
```

## Output / Deliverables
- Database popolato con vettori sincronizzati.
- Report di esecuzione in `docs/reports`.

## Esecuzione Operativa
Per lanciare la pipeline:

```bash
# Esecuzione Standard
npx dotenvx run -f packages/ingestion/.env -- npx ts-node packages/ingestion/src/run.ts

# In caso di errori ESM
npx dotenvx run -f packages/ingestion/.env -- npx ts-node --esm packages/ingestion/src/run.ts
```

### Verifica SQL
```sql
select count(*) from chunks where exam_id='diritto-privato';
```
