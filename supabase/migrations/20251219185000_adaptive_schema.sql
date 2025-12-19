-- Migration: Learning Progress (Adaptive Soft)
-- Date: 2025-12-19
-- Table: learning_progress

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- Links to auth.users or anon ID
  exam_id text not null,
  topic text not null, -- Topic Name (e.g. "Diritti Reali")
  
  mastery_score float default 0, -- 0 to 100
  confidence float default 0, -- 0.0 to 1.0 (self-reported or inferred)
  trend text check (trend in ('improving', 'stable', 'declining', 'new')) default 'new',
  
  last_reviewed timestamptz default now(),
  updated_at timestamptz default now(),

  -- Ensure one record per topic per user
  unique(user_id, exam_id, topic)
);

-- RLS
alter table public.learning_progress enable row level security;

-- Policies (Service Role has full access, Users see own)
create policy "Users can view own progress" on public.learning_progress
  for select using (auth.uid()::text = user_id);
-- Note: Depending on auth setup, might need 'true' for service role or check jwt.
-- For MVP using Service Role Key in Edge Functions, RLS is bypassed.
