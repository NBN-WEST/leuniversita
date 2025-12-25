# UI E2E Capture Log (v0.13.2)

**Evaluator**: Browser Subagent / Automated
**Date**: 2025-12-24
**Environment**: Local (MacBook Pro)

## Test Sequence

### 1. Start Diagnostic
- URL: `http://localhost:3000/diagnostic/d7515f48-0d00-4824-a745-f09d30058e5f`
- Action: Click "Inizia il Test"
- Expected: Progress bar appears, Question 1 displayed.

### 2. Complete Assessment
- Answer 3 questions.
- Click "Invia Risposte".
- Expected: Redirect to `/results/[attemptId]`.

### 3. Verify Results (Hardened)
- URL: `/results/...`
- **Check**: Page must display "Punteggio ottenuto" and "Livello assegnato" (fetched from API, NOT url params).
- **Check**: Loading spinner appears initially.

### 4. Verify Plan & Progress
- Navigate to `/plan`.
- **Check**: Module Titles displayed.
- Navigate to `/progress`.
- **Check**: Status updated.

## Evidence Log
(Output from Browser Automation)
