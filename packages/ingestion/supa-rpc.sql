-- Run this in Supabase SQL Editor to enable efficient vector search
create or replace function public.match_chunks(
  filter_exam_id text,
  match_count int,
  match_threshold float,
  query_embedding vector(1536)
)
returns table (
  id uuid,
  exam_id text,
  visibility text,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    c.id,
    c.exam_id,
    c.visibility,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.chunks c
  where c.exam_id = filter_exam_id
    and c.embedding is not null
    and (1 - (c.embedding <=> query_embedding)) >= match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
