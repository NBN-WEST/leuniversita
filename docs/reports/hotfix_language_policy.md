# Hotfix Report: Language Policy (Italian Default)

**Date**: 2025-12-19
**Type**: Hotfix (Language Compliance)
**Status**: ✅ COMPLETED

## Changes Implemented
1. **Edge Functions**: 
   - `diagnostic-start`: Prompt updated to "Genera in Italiano". Added `meta.language = "it"`.
   - `study-plan`: Prompt "SCRIVI TUTTO IN ITALIANO". Added `meta.language = "it"`.
   - `adaptive-review`: Prompt "NON usare inglese". Added `meta.language = "it"`.
   - `chat`: Added `meta.language = "it"`.
2. **Frontend**: 
   - Audited `apps/pilot-web` for English UI text. 
   - Verified `<html lang="it">`.
3. **Governance**:
   - Added `ADR-013` (Italian Default).
   - Updated `GUIDELINES.md`.

## Validation Results
- **Test Script**: `scripts/test_hotfix_language.ts`
- **Result**: PASS
- **Checks**:
  - `diagnostic-start`: No English stopwords. Meta confirmed.
  - `adaptive-review`: No English stopwords. Meta confirmed.
  - `chat`: Meta confirmed.

## Conclusion
The application is now enforced to Strict Italian Default for the Pilot Demo.
