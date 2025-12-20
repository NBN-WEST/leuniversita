---
id: PRD-MVP
title: MVP Scope
owner: PM
status: active
created_at: 2025-12-20
updated_at: 2025-12-20
tags: [product, scope, requirements]
related: [PRD-INDEX]
source_of_truth: true
mermaid: required
---

# MVP Scope

Definizione del perimetro per il lancio ("Pilot").

## In Scope (Incluso)
1.  **Materia Unica**: Diritto Privato.
2.  **Valutazione Iniziale (Diagnostica)**:
    - Quiz a risposta multipla generati da AI.
    - Analisi gap (Skill Map).
3.  **Chat Tutor**:
    - RAG su manuali caricati.
    - Citazioni obbligatorie delle fonti.
4.  **Auth**:
    - Login/Signup (Magic Link Supabase).
    - Profilo studente base.

## Out of Scope (Escluso per ora)
- Altre materie (Diritto Pubblico, ecc.).
- App Mobile nativa (solo Web Responsive).
- Pagamenti/Abbonamenti (Pilot gratuito/demo).
- Integrazione LMS dell'ateneo (Moodle, Blackboard).
- Social features (amici, classifiche).

## Assunzioni
- Gli studenti hanno accesso a dispositivi web.
- I PDF dei manuali sono forniti e liberi da DRM restrittivi per l'ingestione.

## Feature Map
```mermaid
mindmap
  root((MVP))
    In Scope
      Auth
        Magic Link
      Diagnostica
        Quiz AI
        Skill Map
      Tutor
        Chat RAG
        Citazioni
      Content
        Diritto Privato
    Out of Scope
      Mobile App
      Pagamenti
      Social
      Altre materie
```
