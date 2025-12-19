-- Migration: Profiles and Monetization Tiers
-- Date: 2025-12-19

-- Create Tier Enum
create type public.subscription_tier as enum ('free', 'premium', 'pilot');

-- Create Profiles Table
create table if not exists public.profiles (
  user_id text primary key, -- References auth.users provided by Supabase (simulated here as text for independent testing)
  tier public.subscription_tier default 'free'::public.subscription_tier,
  first_name text,
  last_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid()::text = user_id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid()::text = user_id);

create policy "Service role can manage all" on public.profiles
  for all using (true); -- Simplified for MVP admin/scripts

-- Seed Test Users (Manual Entry for testing scripts)
insert into public.profiles (user_id, tier) values 
('test-user-free', 'free'),
('test-user-premium', 'premium')
on conflict (user_id) do update set tier = EXCLUDED.tier;
