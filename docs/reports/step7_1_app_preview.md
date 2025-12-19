# Step 7.1 Report: Pilot Visual App Preview

**Date**: 2025-12-19
**Status**: ✅ DEMO READY (Local)
**URL**: [http://localhost:3000](http://localhost:3000)

## 1. Demo Setup (Automated)
- **Frontend**: Running locally via `npm run dev`.
- **Auth**: Supabase Client Configured.
- **Data**: Seeded with demo accounts.

## 2. Test Accounts
| Role | Email | Password |
|------|-------|----------|
| **Studente** | `studente1@nbn-west.com` | `password123` |
| **Admin** | `admin@nbn-west.com` | `password123` |

## 3. Recommended Flow (Cosa guardare)
1. **Login Student**: Accedi come `studente1`.
2. **Home**: Vedi la lista esami (1 corso attivo).
3. **Diagnostico**: Avvia un diagnostico, rispondi a caso per vedere la Skill Map generata.
4. **Piano**: Genera il piano di studio personalizzato.
5. **Admin**: Logout e accedi come `admin` per vedere i KPI della classe.

## ⚠️ Security Notice
This local preview is using the **Service Role Key** as the Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) in `.env.local` to bypass the missing Anon Key in the environment.
**DO NOT DEPLOY THIS CONFIGURATION TO PRODUCTION.**
For a real Vercel deploy, you must set the correct `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel Dashboard.
