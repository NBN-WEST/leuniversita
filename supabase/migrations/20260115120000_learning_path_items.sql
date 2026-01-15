-- Learning Path Items: map course -> modules with order and type
create table if not exists public.learning_path_items (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  module_id uuid references public.modules(id) on delete cascade not null,
  type text default 'core' check (type in ('core', 'reinforcement')),
  order_index int default 0,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default now(),
  unique(course_id, module_id)
);

create index if not exists learning_path_items_course_idx on public.learning_path_items(course_id);
create index if not exists learning_path_items_module_idx on public.learning_path_items(module_id);
