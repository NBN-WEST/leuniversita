-- FIX: Add Unique Constraint to Learning Plans
-- Required for Upsert to work correctly and prevent duplicates
-- Run this in Supabase SQL Editor

-- 1. Clean up any existing duplicates (keeping the most recent one)
DELETE FROM public.learning_plans_v2 a USING (
      SELECT min(ctid) as ctid, user_id, course_id
      FROM public.learning_plans_v2 
      GROUP BY user_id, course_id HAVING COUNT(*) > 1
      ) b
      WHERE a.user_id = b.user_id 
      AND a.course_id = b.course_id 
      AND a.ctid <> b.ctid;

-- 2. Add the Constraint
ALTER TABLE public.learning_plans_v2 
ADD CONSTRAINT learning_plans_v2_user_course_unique 
UNIQUE (user_id, course_id);
