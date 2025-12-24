# UI E2E Verification Checklist (v0.13.0)

## Pre-requisites
- [ ] Server running (`npm run dev`)
- [ ] Logged in as a student user (or create new account)
- [ ] V2 Database seeded (`./scripts/test/seed_v2.ts` ran previously)

## Flow Steps

### 1. Diagnostic Start
- [ ] Navigate to `/diagnostic/diritto-privato` (or `d7515f48-0d00-4824-a745-f09d30058e5f`)
- [ ] **Verify**: Page loads with "Diagnostic Test" title and "Inizia il Test" button.
- [ ] **Action**: Click "Inizia".
- [ ] **Verify**: "Caricamento..." state appears briefly.
- [ ] **Verify**: First question appears with progress bar "Domanda 1 di X".

### 2. Question Loop
- [ ] **Action**: Select an option.
- [ ] **Action**: Click "Avanti".
- [ ] **Verify**: Moves to Step 2.
- [ ] **Action**: Use "Indietro" button.
- [ ] **Verify**: Returns to Step 1, previous answer remembered.
- [ ] **Action**: Proceed to the last question.
- [ ] **Verify**: Button changes to "Invia Risposte".

### 3. Submission
- [ ] **Action**: Click "Invia Risposte".
- [ ] **Verify**: Loading state appears.
- [ ] **Verify**: Redirects to `/results/[attemptId]`.

### 4. Results
- [ ] **Verify**: "Analisi Completata!" success message.
- [ ] **Verify**: "Il tuo Livello" card exists.
- [ ] **Verify**: "Vedi il Piano di Studio" button exists.

### 5. Plan
- [ ] **Action**: Click "Vedi il Piano di Studio".
- [ ] **Verify**: URL is `/plan`.
- [ ] **Verify**: List of modules appears (Plan Items).
- [ ] **Verify**: "Vedi Statistiche" button exists.

### 6. Progress
- [ ] **Action**: Click "Vedi Statistiche".
- [ ] **Verify**: URL is `/progress`.
- [ ] **Verify**: Modules list loads with status badges.

## Notes
- If any "Errore" appears, check console for Proxy API failures.
- Ensure no direct Supabase DB errors in console network tab (only API calls).
