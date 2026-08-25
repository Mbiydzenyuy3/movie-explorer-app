-- VibeBox — schema + Row Level Security
--
-- FIRST-RUN SCRIPT. Contains no DROP statements, so it will not trigger
-- Supabase's "destructive operations" warning. It only creates things:
-- `create table if not exists`, `create index if not exists`, `create policy`.
--
-- Because Postgres has no `create policy if not exists`, re-running this after
-- the policies exist will error with "policy already exists". That is safe --
-- nothing is modified. To re-run cleanly, drop the policies first.
--
-- Run this ONCE in the Supabase SQL Editor:
--   Dashboard -> your project -> SQL Editor (the >_ icon) -> New query -> paste -> Run
-- The SQL Editor is available on the Free plan.
--
-- As of the last check, this project had NO tables: PostgREST reported
-- "Could not find the table 'public.profiles' in the schema cache" and exposed
-- zero tables. So this script creates them and enables RLS in the same pass,
-- which means there is never a window where the tables exist unprotected.
--
-- Auth is Clerk, not Supabase Auth. Identity therefore comes from the Clerk
-- JWT's `sub` claim rather than auth.uid(). getSupabaseClient() in
-- src/services/supabaseClient.js attaches that JWT.

-- ---------------------------------------------------------------- helper
-- Clerk user id from the verified JWT, e.g. "user_2ab...".
create or replace function public.clerk_user_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')
$$;

-- --------------------------------------------------------------- profiles
-- `id` holds the Clerk user id directly (text, not uuid) because that is what
-- src/services/userService.js upserts with onConflict:'id'.
create table if not exists public.profiles (
  id          text primary key,
  email       text,
  full_name   text,
  avatar_url  text,
  plan        text not null default 'free',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint profiles_plan_check check (plan in ('free', 'pro'))
);

alter table public.profiles enable row level security;

create policy "profiles: owner reads"
  on public.profiles for select
  using (id = public.clerk_user_id());

create policy "profiles: owner inserts"
  on public.profiles for insert
  with check (id = public.clerk_user_id());

create policy "profiles: owner updates"
  on public.profiles for update
  using (id = public.clerk_user_id())
  with check (id = public.clerk_user_id());

-- No delete policy on purpose: account deletion should go through a reviewed
-- server-side path, not a client call.

-- ---------------------------------------------------------- watch_history
-- Despite the name this now records *recently viewed* titles. The progress
-- columns are retained at 0 because they are the right shape if licensed
-- playback is ever added. See docs/decisions/0001-drop-unlicensed-streaming.md.
create table if not exists public.watch_history (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null references public.profiles(id) on delete cascade,
  movie_id          text not null,
  title             text,
  poster_path       text,
  backdrop_path     text,
  progress_seconds  integer not null default 0,
  duration_seconds  integer not null default 0,
  is_completed      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Required by the upsert's onConflict:'user_id,movie_id'.
create unique index if not exists watch_history_user_movie_idx
  on public.watch_history (user_id, movie_id);

-- getRecentHistory orders by updated_at desc and filters is_completed = false.
create index if not exists watch_history_recent_idx
  on public.watch_history (user_id, is_completed, updated_at desc);

alter table public.watch_history enable row level security;

create policy "watch_history: owner reads"
  on public.watch_history for select
  using (user_id = public.clerk_user_id());

create policy "watch_history: owner inserts"
  on public.watch_history for insert
  with check (user_id = public.clerk_user_id());

create policy "watch_history: owner updates"
  on public.watch_history for update
  using (user_id = public.clerk_user_id())
  with check (user_id = public.clerk_user_id());

create policy "watch_history: owner deletes"
  on public.watch_history for delete
  using (user_id = public.clerk_user_id());

-- ---------------------------------------------------------- verification
-- Expect rls_enabled = true and policy_count > 0 for BOTH tables.
select
  c.relname        as table_name,
  c.relrowsecurity as rls_enabled,
  count(p.policyname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p
  on p.tablename = c.relname and p.schemaname = n.nspname
where n.nspname = 'public'
  and c.relname in ('profiles', 'watch_history')
group by c.relname, c.relrowsecurity;
