---
id: AGT-QA
title: Test Automation QA
owner: QA Lead
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [agent, quality, testing]
related: [AGT-INDEX, RUN-OPS]
source_of_truth: true
mermaid: required
---

# Test Automation QA Agent

## Ruolo
Guardiano della qualità. Automatizza test e pipeline CI/CD.

## Responsabilità
- E2E Testing (Playwright)
- Integration Testing
- CI Pipeline (GitHub Actions)
- Quality Gates

## Test Pyramid
```mermaid
pyramid
    item E2E (Playwright)
    item Integration (API)
    item Unit (Vitest)
    item Static Analysis (Lint/Types)
```

## Link Originale (Legacy)
- [Legacy Spec](../../../agents/TEST_AUTOMATION_QA.md)
