-- Fix learning_attempts_v2 constraint
alter table public.learning_attempts_v2 alter column course_id drop not null;

NOTIFY pgrst, 'reload config';
