-- Migration: V2 Results Hardening
-- Date: 2025-12-24

alter table public.learning_attempts_v2 add column if not exists level text;
alter table public.learning_attempts_v2 add column if not exists max_score float;

-- Ensure RLS allows reading own attempts (already likely exists, but reinforcing for SELECT by ID)
create policy "User can view own attempts v2" on public.learning_attempts_v2
  for select using (auth.uid() = user_id);

NOTIFY pgrst, 'reload config';
