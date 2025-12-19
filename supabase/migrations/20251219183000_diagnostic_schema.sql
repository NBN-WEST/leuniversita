-- Migration: Diagnostic Engine Schema
-- Date: 2025-12-19
-- Tables: diagnostic_attempts, diagnostic_questions, diagnostic_answers

-- 1. Diagnostic Attempts
create table if not exists public.diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id text, -- Nullable for MVP/Anon
  exam_id text not null,
  status text not null check (status in ('in_progress', 'completed')) default 'in_progress',
  total_score float,
  skill_map jsonb,
  meta jsonb,
  created_at timestamptz default now()
);

-- 2. Diagnostic Questions
create table if not exists public.diagnostic_questions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.diagnostic_attempts(id) on delete cascade,
  exam_id text,
  topic text,
  difficulty int,
  type text not null check (type in ('MCQ', 'OPEN')),
  prompt text not null,
  options jsonb, -- Array of strings for MCQ
  correct_answer jsonb, -- Object or string. HIDDEN from client in ideal scenario (via select exclusion or function only)
  citations jsonb, -- Array of citation objects
  created_at timestamptz default now()
);

-- 3. Diagnostic Answers
create table if not exists public.diagnostic_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.diagnostic_attempts(id) on delete cascade,
  question_id uuid references public.diagnostic_questions(id) on delete cascade,
  answer jsonb, -- User's answer
  is_correct boolean,
  score float,
  feedback text,
  created_at timestamptz default now()
);

-- 4. Security (RLS)
-- Enable RLS
alter table public.diagnostic_attempts enable row level security;
alter table public.diagnostic_questions enable row level security;
alter table public.diagnostic_answers enable row level security;

-- Policies
-- Since logic is handled via Edge Functions (Service Role), we theoretically don't need public access.
-- But for debugging or client direct access (if architected that way), we defines:

-- Service Role has full access bypasses RLS.

-- For Anon/Public (if needed for client-side reads not via function):
-- create policy "Allow public read own attempt" on public.diagnostic_attempts for select using (true); 
-- (Skipping open policies for Secure-by-Design. Access should be mediated by Edge Functions).
