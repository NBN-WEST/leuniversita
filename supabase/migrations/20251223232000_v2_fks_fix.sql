-- Force Fix for Missing Columns and FKs
-- Date: 2025-12-23 (Late)

-- Ensure columns exist (Stale Schema Recovery)
alter table public.learning_attempts_v2 add column if not exists assessment_id text not null;
alter table public.learning_attempts_v2 alter column assessment_id type text using assessment_id::text;
alter table public.learning_attempts_v2 add column if not exists status text default 'in_progress' check (status in ('in_progress', 'completed'));
alter table public.learning_attempts_v2 add column if not exists score float;
alter table public.learning_attempts_v2 add column if not exists started_at timestamptz default now();
alter table public.learning_attempts_v2 add column if not exists completed_at timestamptz;


alter table public.learning_answers_v2 add column if not exists question_id text not null;
alter table public.learning_answers_v2 alter column question_id type text using question_id::text;

alter table public.learning_answers_v2 add column if not exists selected_option_id text;
alter table public.learning_answers_v2 alter column selected_option_id type text using selected_option_id::text;

alter table public.learning_answers_v2 add column if not exists text_answer text;
alter table public.learning_answers_v2 add column if not exists is_correct boolean;

-- Fix learning_plans_v2 columns
alter table public.learning_plans_v2 add column if not exists level text default 'beginner';
alter table public.learning_plans_v2 add column if not exists status text default 'active';

-- Force reload schema cache
alter table public.learning_attempts_v2 alter column course_id drop not null;

NOTIFY pgrst, 'reload config';
