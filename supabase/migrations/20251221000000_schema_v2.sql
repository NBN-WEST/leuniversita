-- Migration: Learning Engine Schema V2 (Strict Parallel)
-- Date: 2025-12-21
-- Description: V2 Schema with explicit V2 suffixes for ALL tracking tables.

-- ==============================================================================
-- 1. CATALOG DOMAIN (New Tables)
-- ==============================================================================
-- These tables define the static content structure.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  slug text not null, -- e.g. '01-fonti'
  server_id text unique, -- e.g. 'MOD-PRIV-01'
  title text not null,
  order_index int default 0,
  created_at timestamptz default now(),
  unique(course_id, slug)
);

create table if not exists public.learning_objectives (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade not null,
  code text,
  description text not null,
  kpi_ref text,
  created_at timestamptz default now()
);

-- Legacy tables removed from V2 definition to avoid conflict with REAL legacy tables (TEXT vs UUID id).
-- See 20251223223000_v2_isolation.sql for V2 versions (assessments_v2, etc.)

-- create table if not exists public.assessments ( ... );
-- create table if not exists public.questions ( ... );
-- create table if not exists public.question_options ( ... );

-- ==============================================================================
-- 2. TRACKING DOMAIN (V2 Specific)
-- ==============================================================================
-- These tables track user progress. Suffix _v2 used for ALL tracking to avoid collision.

create table if not exists public.learning_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  course_id text references public.courses(id) on delete cascade not null,
  level text default 'beginner',
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.learning_plans(id) on delete cascade not null,
  module_id text references public.modules(id) on delete cascade not null,
  status text default 'todo' check (status in ('todo', 'done', 'skipped', 'locked')),
  type text default 'core',
  created_at timestamptz default now()
);

create table if not exists public.learning_progress_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  course_id text references public.courses(id) on delete cascade not null,
  module_id text references public.modules(id) on delete cascade not null,
  status text default 'locked' check (status in ('locked', 'available', 'in_progress', 'completed', 'mastered')),
  current_unit_index int default 0,
  last_score float,
  updated_at timestamptz default now(),
  unique(user_id, module_id)
);

create table if not exists public.learning_attempts_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  assessment_id uuid not null, -- FK added in later migration
  status text default 'in_progress' check (status in ('in_progress', 'completed')),
  score float,
  started_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists public.learning_answers_v2 (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.learning_attempts_v2(id) on delete cascade not null,
  question_id uuid not null, -- FK added in later migration
  selected_option_id uuid, -- FK added in later migration
  text_answer text,
  is_correct boolean,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 3. RLS POLICIES
-- ==============================================================================

-- Enable RLS
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.learning_objectives enable row level security;
-- alter table public.assessments enable row level security;
-- alter table public.questions enable row level security;
-- alter table public.question_options enable row level security;

alter table public.learning_plans enable row level security;
alter table public.plan_items enable row level security;
alter table public.learning_progress_v2 enable row level security;
alter table public.learning_attempts_v2 enable row level security;
alter table public.learning_answers_v2 enable row level security;

-- PUBLIC READ (Catalog)
create policy "Allow public read courses" on public.courses for select using (true);
create policy "Allow public read modules" on public.modules for select using (true);
create policy "Allow public read objectives" on public.learning_objectives for select using (true);

-- create policy "Allow public read assessments" on public.assessments for select using (true);
-- create policy "Allow public read questions" on public.questions for select using (true);
-- create policy "Allow public read options" on public.question_options for select using (true);

-- USER OWNER ACCESS (Tracking)
create policy "User can manage own plans" on public.learning_plans 
  for all using (auth.uid() = user_id);

create policy "User can manage own plan items" on public.plan_items 
  for all using (
    exists (select 1 from public.learning_plans where id = plan_items.plan_id and user_id = auth.uid())
  );

create policy "User can manage own progress v2" on public.learning_progress_v2 
  for all using (auth.uid() = user_id);

create policy "User can manage own attempts v2" on public.learning_attempts_v2
  for all using (auth.uid() = user_id);

create policy "User can manage own answers v2" on public.learning_answers_v2
  for all using (
    exists (select 1 from public.learning_attempts_v2 where id = learning_answers_v2.attempt_id and user_id = auth.uid())
  );
