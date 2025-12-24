-- Migration: Isolation V2 (Strict Separate Tables)
-- Date: 2025-12-23
-- Description: Create dedicated V2 tables for Assessments/Questions to avoid Legacy interactions.

-- 1. Assessments V2
create table if not exists public.assessments_v2 (
  id uuid primary key default gen_random_uuid(),
  course_id text references public.courses(id) on delete cascade, 
  module_id text references public.modules(id) on delete cascade, -- Optional
  type text not null check (type in ('diagnostic', 'formative', 'summative')),
  settings jsonb default '{}', -- e.g. time_limit
  created_at timestamptz default now()
);

-- 2. Questions V2
create table if not exists public.questions_v2 (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments_v2(id) on delete cascade not null,
  prompt text not null,
  difficulty int default 1 check (difficulty between 1 and 5),
  explanation text,
  created_at timestamptz default now()
);

-- 3. Question Options V2
create table if not exists public.question_options_v2 (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions_v2(id) on delete cascade not null,
  label text not null,
  is_correct boolean default false,
  created_at timestamptz default now()
);

-- 4. Enable RLS
alter table public.assessments_v2 enable row level security;
alter table public.questions_v2 enable row level security;
alter table public.question_options_v2 enable row level security;

-- 5. Policies (Public Read for Catalog)
create policy "Allow public read assessments_v2" on public.assessments_v2 for select using (true);
create policy "Allow public read questions_v2" on public.questions_v2 for select using (true);
create policy "Allow public read options_v2" on public.question_options_v2 for select using (true);

-- 6. Update FKs for Tracking Tables
-- Force TEXT type compatibility (Legacy/V2 Hybrid robustness)
alter table public.learning_attempts_v2 add column if not exists assessment_id text not null;
alter table public.learning_attempts_v2 alter column assessment_id type text using assessment_id::text;
-- Ensure other columns exist (Stale Schema Recovery)
alter table public.learning_attempts_v2 add column if not exists status text default 'in_progress' check (status in ('in_progress', 'completed'));
alter table public.learning_attempts_v2 add column if not exists score float;
alter table public.learning_attempts_v2 add column if not exists started_at timestamptz default now();
alter table public.learning_attempts_v2 add column if not exists completed_at timestamptz;


alter table public.learning_answers_v2 add column if not exists question_id text not null;
alter table public.learning_answers_v2 alter column question_id type text using question_id::text;

alter table public.learning_answers_v2 add column if not exists selected_option_id text;
alter table public.learning_answers_v2 alter column selected_option_id type text using selected_option_id::text;

-- Recover learning_answers_v2 columns
alter table public.learning_answers_v2 add column if not exists text_answer text;
alter table public.learning_answers_v2 add column if not exists is_correct boolean;

-- Force reload schema cache
NOTIFY pgrst, 'reload config';


-- Remove old constraint
alter table public.learning_attempts_v2 drop constraint if exists learning_attempts_v2_assessment_id_fkey;
-- Add new constraint
alter table public.learning_attempts_v2 add constraint learning_attempts_v2_assessment_id_fkey 
  foreign key (assessment_id) references public.assessments_v2(id) on delete cascade;


-- Same for learning_answers_v2 -> questions_v2
alter table public.learning_answers_v2 drop constraint if exists learning_answers_v2_question_id_fkey;
alter table public.learning_answers_v2 add constraint learning_answers_v2_question_id_fkey
  foreign key (question_id) references public.questions_v2(id) on delete cascade;

alter table public.learning_answers_v2 drop constraint if exists learning_answers_v2_selected_option_id_fkey;
alter table public.learning_answers_v2 add constraint learning_answers_v2_selected_option_id_fkey
  foreign key (selected_option_id) references public.question_options_v2(id) on delete cascade;
