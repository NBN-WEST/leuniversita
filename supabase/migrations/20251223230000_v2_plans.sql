-- Migration: Learning Plans V2 (Isolated)
-- Date: 2025-12-23

create table if not exists public.learning_plans_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  course_id text references public.courses(id) on delete cascade not null,
  level text default 'beginner',
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.plan_items_v2 (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.learning_plans_v2(id) on delete cascade not null,
  module_id text references public.modules(id) on delete cascade not null,
  status text default 'todo' check (status in ('todo', 'done', 'skipped', 'locked')),
  type text default 'core',
  created_at timestamptz default now()
);

alter table public.learning_plans_v2 enable row level security;
alter table public.plan_items_v2 enable row level security;

create policy "User can manage own plans v2" on public.learning_plans_v2 
  for all using (auth.uid() = user_id);

create policy "User can manage own plan items v2" on public.plan_items_v2 
  for all using (
    exists (select 1 from public.learning_plans_v2 where id = plan_items_v2.plan_id and user_id = auth.uid())
  );

-- ENSURE FK FIX IS APPLIED (Idempotent)
do $$
begin
  if not exists (
      select 1 from information_schema.table_constraints 
      where constraint_name = 'learning_attempts_v2_assessment_id_fkey' 
      and table_name = 'learning_attempts_v2'
  ) then
      -- Apply fix if constraint name doesn't exist (simplification)
      -- But we know we want to POINT to assessments_v2. 
      -- We'll just run alter table.
      alter table public.learning_attempts_v2 drop constraint if exists learning_attempts_v2_assessment_id_fkey;
      alter table public.learning_attempts_v2 add constraint learning_attempts_v2_assessment_id_fkey 
          foreign key (assessment_id) references public.assessments_v2(id) on delete cascade;
  end if;
end $$;

-- Same for Answers
alter table public.learning_answers_v2 drop constraint if exists learning_answers_v2_question_id_fkey;
alter table public.learning_answers_v2 add constraint learning_answers_v2_question_id_fkey
  foreign key (question_id) references public.questions_v2(id) on delete cascade;

alter table public.learning_answers_v2 drop constraint if exists learning_answers_v2_selected_option_id_fkey;
alter table public.learning_answers_v2 add constraint learning_answers_v2_selected_option_id_fkey
  foreign key (selected_option_id) references public.question_options_v2(id) on delete cascade;
