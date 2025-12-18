# Step A: Public Layer Boost Report
**Date**: Thu Dec 18 24:18:00 CET 2025

## Public Sources Added
- `dispensa_concetti_base_pubblica.md`
- `normattiva_capacita_agire.md`
- `wikibooks_diritto_privato_base.md`
- `treccani_concetti_base.md` (Updated with URL)

## DB Counts Check
✅ Public Chunks: 103 (Target >= 80)

## Chat Verification (Strict Metadata Check)
**Endpoint**: `https://ggynfvaibntlhzvsfdet.supabase.co/functions/v1/chat`

**Query**: "Cos’è la capacità di agire?"

**Response Data**:
```json
{
  "exam_id": "diritto-privato",
  "answer": "La capacità di agire è l'idoneità di una persona a compiere validamente atti giuridici che producono effetti nella propria sfera personale e patrimoniale, come stipulare contratti o vendere beni. Questa capacità si acquisisce con la maggiore età, fissata al compimento del diciottesimo anno (Art. 2 Cod. Civ.), momento in cui si presume che il soggetto abbia raggiunto la maturità necessaria per curare i propri interessi.",
  "citations": [
    {
      "chunk_id": "16ede4aa-d502-4eea-b796-aa0a257d2d18",
      "similarity": 0.6202,
      "source_title": "Dispensa Concetti Fondamentali Diritto Privato",
      "source_url": "https://www.leuniversita.it/dispense/diritto-privato/fondamenti"
    },
    {
      "chunk_id": "d4e9675f-ff7e-4475-bc66-c53bc49c184e",
      "similarity": 0.5607,
      "source_title": "Treccani Concetti Base",
      "source_url": "https://www.treccani.it/enciclopedia/diritto-privato/"
    },
    {
      "chunk_id": "41732d66-f28f-410a-b26d-5ac4ec1e38e0",
      "similarity": 0.4618,
      "source_title": "Codice Civile - Estratto Capacità di Agire",
      "source_url": "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262"
    }
  ],
  "meta": {
    "k": 8,
    "threshold": 0.35,
    "used_public": 3
  }
}
```

## Validation Status
✅ **PASS**
- Citations Present
- No "Unknown Source"
- Valid URLs for all Public Sources
