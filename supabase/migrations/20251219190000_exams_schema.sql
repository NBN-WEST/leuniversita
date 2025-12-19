-- Migration: Exams Table (Multi-Exam Support)
-- Reparation: Handle existing table scenario completely

create table if not exists public.exams (
  id text primary key,
  title text not null,
  created_at timestamptz default now()
);

-- Add columns individually if they don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'exams' and column_name = 'description') then
    alter table public.exams add column description text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'exams' and column_name = 'icon_name') then
    alter table public.exams add column icon_name text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'exams' and column_name = 'is_active') then
    alter table public.exams add column is_active boolean default true;
  end if;
end $$;

-- Enable RLS
alter table public.exams enable row level security;

-- Drop policy if exists to avoid conflict
drop policy if exists "Public exams are viewable" on public.exams;

create policy "Public exams are viewable" on public.exams
  for select using (is_active = true);

-- Seed Initial Exam
insert into public.exams (id, title, description, icon_name)
values 
  ('diritto-privato', 'Diritto Privato', 'Il corso fondamentale per le basi del diritto civile.', 'scale')
on conflict (id) do update 
set description = EXCLUDED.description, icon_name = EXCLUDED.icon_name;
