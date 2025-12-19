# Go-Live Checklist: Ateneo Pilot

## 1. Environment & Security
- [ ] **Config**: `.env.local` su Vercel/Locale matchano le chiavi di produzione.
- [ ] **Secrets**: Nessun segreto committato su GitHub.
- [ ] **RLS**: Policies attive su `profiles`, `learning_progress`.

## 2. Dati & Demo Accounts
- [ ] **Reset**: Cancellare dati di prova relativi a `demo-student-new`.
- [ ] **Seed**: Verificare che `demo-student-progress` abbia dati popolati (Skill Map visibile).
- [ ] **Admin**: Verificare accesso alla dashboard Admin.

## 3. Funzionalità Core (Smoke Test pre-demo)
- [ ] Login rapido (< 2s).
- [ ] Ingestion: Assicurarsi che i documenti del corso Diritto Privato siano indicizzati (Chiedere conferma ingestion status).
- [ ] Edge Functions: "Warm up" (Eseguire una chiamata a vuoto per evitare cold start durante la demo).

## 4. Fallback Plan
- [ ] Se OpenAI è down: Mostrare screenshot statici del risultato (tenere pronti nella cartella `docs/demo_assets`).
- [ ] Se Supabase Auth fallisce: Usare video di backup della flow.

## 5. Script
- [ ] Copia stampata del `demo_script_institutional.md`.
- [ ] Timer pronto (15 min).
