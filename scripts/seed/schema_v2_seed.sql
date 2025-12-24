-- Seed for Diritto Privato MVP (Schema V2)
-- Usage: psql -f scripts/seed/schema_v2_seed.sql
-- Tables: courses, modules, assessments, questions, question_options

-- 1. Course
insert into public.courses (slug, title, description) values 
('diritto-privato', 'Diritto Privato', 'Il corso fondamentale per gli studi giuridici.')
on conflict (slug) do nothing;

do $$
declare
  cid uuid;
  mid_01 uuid;
  ass_diag uuid;
  q1 uuid;
begin
  select id into cid from public.courses where slug = 'diritto-privato';

  -- 2. Modules
  insert into public.modules (course_id, slug, server_id, title, order_index) values
  (cid, '01-fonti', 'MOD-PRIV-01', 'Fonti del Diritto', 1),
  (cid, '02-diritti', 'MOD-PRIV-02', 'Diritti Soggettivi', 2),
  (cid, '03-soggetti', 'MOD-PRIV-03', 'Soggetti di Diritto', 3),
  (cid, '04-beni', 'MOD-PRIV-04', 'Beni e Proprietà', 4),
  (cid, '05-obbligazioni', 'MOD-PRIV-05', 'Obbligazioni', 5),
  (cid, '06-contratti', 'MOD-PRIV-06', 'Contratti', 6)
  on conflict (course_id, slug) do nothing;

  select id into mid_01 from public.modules where slug = '01-fonti';

  -- 3. Learning Objectives (Stub for Module 1)
  insert into public.learning_objectives (module_id, code, description) values
  (mid_01, 'LO-01-01', 'Distinguere la gerarchia delle fonti'),
  (mid_01, 'LO-01-02', 'Comprendere il criterio cronologico');

  -- 4. Diagnostic Assessment
  insert into public.assessments (course_id, type, settings) 
  values (cid, 'diagnostic', '{"time_limit": 1800}')
  returning id into ass_diag;

  -- 5. Diagnostic Question 1 (Stub)
  insert into public.questions (assessment_id, prompt, difficulty)
  values (ass_diag, 'Quale tra le seguenti è una fonte primaria del diritto?', 1)
  returning id into q1;

  insert into public.question_options (question_id, label, is_correct) values
  (q1, 'Legge ordinaria', true),
  (q1, 'Regolamento condominiale', false),
  (q1, 'Circolare ministeriale', false);

end $$;
