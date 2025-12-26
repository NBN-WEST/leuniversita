-- FIX: Seed V2 Schema for Production (Legacy Missing Data)
-- Run this in Supabase SQL Editor to fix "Diagnostic Assessment Not Found" (404)

-- 1. Ensure Course Exists (Upsert)
INSERT INTO public.courses (id, slug, title, description)
VALUES (
    'd7515f48-0d00-4824-a745-f09d30058e5f',
    'diritto-privato',
    'Diritto Privato',
    'Corso completo V2'
)
ON CONFLICT (slug) DO UPDATE 
SET id = EXCLUDED.id, title = EXCLUDED.title; -- Ensure ID matches for FKs

-- 2. Ensure Modules Exist (Upsert)
INSERT INTO public.modules (id, course_id, exam_id, slug, server_id, title, order_index)
VALUES 
    ('e2b3c4d5-e6f7-4824-a745-f09d30058e51', 'd7515f48-0d00-4824-a745-f09d30058e5f', 'd7515f48-0d00-4824-a745-f09d30058e5f', '01-fonti', 'MOD-PRIV-01', 'Fonti del Diritto', 1),
    ('e2b3c4d5-e6f7-4824-a745-f09d30058e52', 'd7515f48-0d00-4824-a745-f09d30058e5f', 'd7515f48-0d00-4824-a745-f09d30058e5f', '02-diritti', 'MOD-PRIV-02', 'Diritti Soggettivi', 2)
ON CONFLICT (course_id, slug) DO NOTHING;

-- 3. Upsert Diagnostic Assessment (TARGET OF 404 ERROR)
INSERT INTO public.assessments_v2 (id, course_id, type, settings)
VALUES (
    'a4b3c4d5-e6f7-4824-a745-f09d30058e70',
    'd7515f48-0d00-4824-a745-f09d30058e5f',
    'diagnostic',
    '{"time_limit": 1800}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 4. Upsert Questions
INSERT INTO public.questions_v2 (id, assessment_id, prompt, difficulty)
VALUES
    ('b5b3c4d5-e6f7-4824-a745-f09d30058e81', 'a4b3c4d5-e6f7-4824-a745-f09d30058e70', 'Quale tra le seguenti è una fonte primaria del diritto?', 1),
    ('b5b3c4d5-e6f7-4824-a745-f09d30058e82', 'a4b3c4d5-e6f7-4824-a745-f09d30058e70', 'Il codice civile è una legge ordinaria?', 1),
    ('b5b3c4d5-e6f7-4824-a745-f09d30058e83', 'a4b3c4d5-e6f7-4824-a745-f09d30058e70', 'La Costituzione può essere modificata da una legge ordinaria?', 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Upsert Options
INSERT INTO public.question_options_v2 (id, question_id, label, is_correct, sort_order)
VALUES
    -- Q1
    ('c6b3c4d5-e6f7-4824-a745-f09d30058e91', 'b5b3c4d5-e6f7-4824-a745-f09d30058e81', 'Legge ordinaria', true, 1),
    ('c6b3c4d5-e6f7-4824-a745-f09d30058e92', 'b5b3c4d5-e6f7-4824-a745-f09d30058e81', 'Regolamento condominiale', false, 2),
    -- Q2
    ('c6b3c4d5-e6f7-4824-a745-f09d30058e93', 'b5b3c4d5-e6f7-4824-a745-f09d30058e82', 'Sì', true, 1),
    ('c6b3c4d5-e6f7-4824-a745-f09d30058e94', 'b5b3c4d5-e6f7-4824-a745-f09d30058e82', 'No', false, 2),
    -- Q3
    ('c6b3c4d5-e6f7-4824-a745-f09d30058e95', 'b5b3c4d5-e6f7-4824-a745-f09d30058e83', 'Sì', false, 1),
    ('c6b3c4d5-e6f7-4824-a745-f09d30058e96', 'b5b3c4d5-e6f7-4824-a745-f09d30058e83', 'No', true, 2)
ON CONFLICT (id) DO NOTHING;
