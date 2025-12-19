# Pilot Web App (Le Università)

Institutional Visual Application for the Pilot Program.
Built with Next.js 14 (App Router), Tailwind CSS, and Supabase Auth.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env.local` and populate:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_FUNCTIONS_BASE_URL=...
   ```
   > ⚠️ NEVER commit `.env.local` to Git.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Features
- **Auth**: Email/Password login via Supabase.
- **Exam Selector**: List courses available in `exams` table.
- **Diagnostic**: End-to-end logic via Edge Functions (`diagnostic-start`, `diagnostic-submit`).
- **Results**: Visual Skill Map (Recharts).
- **Study Plan**: 7-day generated timeline.

## Deployment (Vercel)
1. Import repository.
2. Add Environment Variables from `.env.local`.
3. Deploy.
