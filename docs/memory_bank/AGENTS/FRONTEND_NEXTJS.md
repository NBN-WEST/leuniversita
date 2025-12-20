---
id: AGT-FE
title: Frontend Next.js
owner: Lead Frontend
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [agent, frontend, nextjs, react]
related: [AGT-INDEX, AGT-UX]
source_of_truth: true
mermaid: required
---

# Frontend Next.js Agent

## Ruolo
Implementa l'interfaccia utente pixel-perfect, accessibile e performante.

## Responsabilità
- App Router Implementation
- React Components
- Client State Management
- Web Vitals Optimization

## Component Flow
```mermaid
graph TD
    Design[Figma/Tokens] -->|Code| Comp[React Component]
    Comp -->|Integrate| Page[Next.js Page]
    Page -->|Fetch| API[Backend API]
```

## Link Originale (Legacy)
- [Legacy Spec](../../../agents/FRONTEND_NEXTJS.md)
