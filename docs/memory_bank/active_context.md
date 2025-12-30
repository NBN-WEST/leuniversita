---
id: CTX-001
title: Active Context
owner: System
status: active
created_at: 2025-12-24
updated_at: 2025-12-24
tags: [context, state, focus]
source_of_truth: true
mermaid: not_applicable
---

# Active Context

## Current Focus
**Phase 12: Back Office & Admin Stub (v1.3.5)**
- **Goal**: Enable full Course Management (CRUD) for Administrators.
- **Status**: **STABLE** (Course Creation, Editing, and Soft Delete Verified).
- **Recent Accomplishments**: 
  - Fixed `null value in column "id"` by implementing client-side UUID generation.
  - Aligned UI/API with Database Schema (Removed `university`, Mapped `is_active` -> `status`).
  - Resolved generic 404 on Edit Page by fixing Next.js 15 `params` await requirement.
  - Implemented **Soft Delete** logic (Status: `archived`) to preserve course data.

## Active Documents
- `apps/pilot-web/app/api/admin/courses/[id]/route.ts` (Dynamic API Handler)
- `apps/pilot-web/app/api/admin/courses/route.ts` (List/Create API)
- `apps/pilot-web/components/admin/CourseForm.tsx` (Course UI)

## Recent Changes
- **Fix**: Updated dynamic route handlers to `await props.params`.
- **Refactor**: Unified `Course` schema types across API and UI.
- **Feat**: Implemented `handleArchive` in Edit Page with Confirmation Dialog.

## Next Steps
1. Deploy to Vercel and verify in production environment.
2. Begin "Learning Path" content association features.
```
