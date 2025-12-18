# Ingestion Validation Report - Diritto Privato
Date: 2025-12-18T23:00:05.174Z

## 1. ENV Check
- SUPABASE_URL: OK
- OPENAI_API_KEY: OK

## 2. Ingestion Logs
```
ℹ️ Filter applied: Ingesting ONLY 'public' sources.

🔍 Processing: Treccani Concetti Base
   ♻️ Document exists (ID: 66e1455d-e984-44fd-acec-4cbd3ca06f39). Replacing...
   ✔ Ingested: Treccani Concetti Base (8 chunks)

🔍 Processing: Dispensa Concetti Fondamentali Diritto Privato
   ♻️ Document exists (ID: 009708fb-e86c-4df6-8b08-d0ae7ea63ec7). Replacing...
   ✔ Ingested: Dispensa Concetti Fondamentali Diritto Privato (43 chunks)

🔍 Processing: Codice Civile - Estratto Capacità di Agire
   ♻️ Document exists (ID: 4317ef7c-c153-45ae-b6cb-56ada62892ec). Replacing...
   ✔ Ingested: Codice Civile - Estratto Capacità di Agire (28 chunks)

🔍 Processing: Wikibooks Diritto Privato - Istituzioni
   ♻️ Document exists (ID: 45a670ef-741f-44a5-a410-8e1b29d551c7). Replacing...
   ✔ Ingested: Wikibooks Diritto Privato - Istituzioni (24 chunks)

✅ Ingestion completed.
```

## 3. DB Counts
- Documents: 6
- Chunks (Total): 1593
- Chunks (Public): 13
- Chunks (Private): 987

## 4. Retrieval Test
Query: "capacità di agire"
⚠️ No matches found (threshold 0.65).

## 5. Final Result
❌ ESITO FINALE: FAIL