-- Migration: Analytics Events
-- Date: 2025-12-19
-- Table: analytics_events

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id text, -- Can be anon session ID or auth ID
  properties jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.analytics_events enable row level security;

-- Policies
-- Service Role can insert/select all (Edge Functions use Service Role)
-- Public checks? generally no public access, ingestion only via functions.
