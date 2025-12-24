-- Fix learning_plans_v2 columns (Status & Level)
alter table public.learning_plans_v2 add column if not exists level text default 'beginner';
alter table public.learning_plans_v2 add column if not exists status text default 'active';

NOTIFY pgrst, 'reload config';
