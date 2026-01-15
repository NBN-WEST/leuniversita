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
  - Resolved `invalid input syntax for integer` in Diagnostic Score calculation.
  - Fixed missing `user_id` constraint violation in Diagnostic Submission.
  - Verified complete "Student Flow" (Login -> Diagnostic -> Results) with test user.

## Active Documents
- `apps/pilot-web/app/api/admin/courses/[id]/route.ts` (Dynamic API Handler)
- `apps/pilot-web/app/api/admin/courses/route.ts` (List/Create API)
- `apps/pilot-web/components/admin/CourseForm.tsx` (Course UI)

## Recent Changes
- **Fix**: Updated dynamic route handlers to `await props.params`.
- **Refactor**: Unified `Course` schema types across API and UI.
- **Feat**: Implemented `handleArchive` in Edit Page with Confirmation Dialog.
- **Feat**: Added Admin Ingestion page with PDF upload and local ingestion trigger.
- **Feat**: Added course publishing status (draft/published/archived) with admin UI.
- **Feat**: Added Admin CRUD for Exams and Modules.
- **Feat**: Added Learning Path associations and plan item sync on diagnostic submit.
- **Feat**: Added Skill Map page with exam selector and cross-exam summary.

## Next Steps
1. Complete Back Office v1: source upload + ingestion trigger + publishing workflow.
2. Start "Learning Path" content association features.
```
