# Prompt: Phase 5 - Diagnostic UI E2E (v0.13.0)

## Context
Phase 4 successfully implemented and verified the "Isolated V2 Backend" for the Learning Engine.
We now have a working set of:
- **V2 Database Tables**: `learning_plans_v2`, `learning_attempts_v2`, etc.
- **V2 Edge Functions**: `diagnostic-start`, `diagnostic-submit` (returning `plan_id`).
- **Next.js Proxy APIs**: Fully functional, correctly forwarding tokens.
  - `POST /api/diagnostic/start`
  - `POST /api/diagnostic/submit`
  - `GET /api/plan/current`
  - `GET /api/progress`

## Goal
Build the **User Interface** that consumes these Verified V2 APIs.
This is an End-to-End (E2E) implementation of the Diagnostic Loop in the Pilot Web App.

## Required Scope

### 1. Routes & Pages
Implement or Refactor the following pages in `apps/pilot-web/app/`:
- **`/diagnostic/[examId]`**:
  - **Start**: Calls `POST /api/diagnostic/start`.
  - **Question Loop**: Displays questions from the response.
  - **Submit**: Calls `POST /api/diagnostic/submit`.
  - **Transition**: Redirects to `/results/[attemptId]` or `/plan` on success.
- **`/results/[attemptId]`** (or integrated Plan View):
  - Displays the generated plan details.
- **`/plan`** (Current Plan):
  - Calls `GET /api/plan/current`.
  - Renders the `Day 1, Day 2...` structure from the V2 `learning_plans_v2` logic.
- **Progress UI**:
  - Visualizes data from `GET /api/progress`.

### 2. UX Constraints
- **Language**: Italian (use `docs/ux/microcopy-it.md` as reference).
- **State Management**: Handle Loading, Error, and Retry states gracefully.
- **No Direct DB Access**: The UI must **ONLY** use the Proxy APIs. Do not import `supabase-js` or `auth-helpers` in Client Components to query the DB directly.
- **Aesthetics**: Premium, clean, "Apple-like" or "Stripe-like" simplicity.

## Deliverables
1. **Code**: Working React/Next.js components.
2. **Verification**: A manual walkthrough or E2E script proving the flow from Start -> Submit -> Plan View works in the browser.
3. **Commit**: `feat(ui): diagnostic flow e2e (v0.13.0)`

## Reporting
Create a report template: `docs/memory_bank/_REPORTS/v0.13.0_ui_e2e_readiness.md` to log verification results.
