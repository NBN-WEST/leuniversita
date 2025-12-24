# Vercel Deployment Checklist

## Environment Variables
Ensure these variables are set in Vercel Project Settings (Production & Preview):

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Check Supabase Dashboard under API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key. |

## Supabase Edge Functions
Current deployment relies on these functions:
- `diagnostic-start`
- `diagnostic-submit`

**Deployment Command:**
```bash
supabase functions deploy --no-verify-jwt
```
(Secrets for functions are managed via `supabase secrets set`).

## Common Issues
### 1. `module not found` in Next.js
- Ensure `components/ui` are committed.
- Ensure `utils/cn.ts` is committed.
- Verify imports match case sensitivity (Linux vs Mac).

### 2. Edge Function CORS/Auth
- The Proxy APIs forward the Authorization header.
- Ensure Supabase Project > Authentication > URL Configuration includes the Vercel domain.

### 3. Middleware
- If using `middleware.ts` for Auth, ensure it handles `api/*` correctly (currently Proxies handle auth manually, so middleware should allow them).

## Pre-Flight Check
Run locally before generic push:
```bash
npm run validate:env
npm run build
```
