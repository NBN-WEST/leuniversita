-- Add publishing status to courses
alter table public.courses
  add column if not exists status text
    check (status in ('draft', 'published', 'archived'))
    default 'draft';

-- Backfill existing rows to published if missing
update public.courses
  set status = 'published'
  where status is null;
