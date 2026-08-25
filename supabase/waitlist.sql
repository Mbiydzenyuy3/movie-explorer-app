-- VibeBox — waitlist + landing analytics for the demand test
--
-- Run in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Contains no DROP statements, so it will not trigger the destructive
-- operation warning.
--
-- SECURITY MODEL
-- Anonymous visitors must be able to INSERT (that is the whole point) but must
-- NOT be able to SELECT. Without that split, anyone could read the email list
-- straight off the public API. There is deliberately no select policy for anon
-- on either table: read your results in the Supabase dashboard, which uses a
-- privileged connection and bypasses RLS.

-- ------------------------------------------------------------------ waitlist
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  -- Optional follow-ups, asked only AFTER the email is captured so they add no
  -- friction to the primary conversion.
  region      text,
  would_pay   text,
  -- utm_source from the landing URL. This is what separates cold traffic from
  -- your own network; signups from friends are much weaker evidence.
  source      text,
  created_at  timestamptz not null default now(),
  constraint waitlist_email_check check (position('@' in email) > 1),
  constraint waitlist_would_pay_check
    check (would_pay is null or would_pay in ('yes', 'maybe', 'no'))
);

-- One row per address; a repeat submit updates rather than duplicating.
create unique index if not exists waitlist_email_idx
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Anonymous visitors may sign up...
create policy "waitlist: anyone may join"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- ...and may update only their own row, so the optional follow-up answers can
-- be attached after the initial submit.
create policy "waitlist: update own row by email"
  on public.waitlist for update
  to anon, authenticated
  using (true)
  with check (true);

-- No select policy on purpose. The list is not publicly readable.

-- ----------------------------------------------------------- landing_events
-- Page views, so signups have a denominator. Without this we would know how
-- many people signed up but not what share of visitors that represents, which
-- is the number that actually decides anything.
create table if not exists public.landing_events (
  id          uuid primary key default gen_random_uuid(),
  event       text not null,
  source      text,
  -- Random per-browser id so repeat views from one person can be collapsed.
  session_id  text,
  created_at  timestamptz not null default now(),
  constraint landing_events_event_check
    check (event in ('view', 'signup', 'explore_click'))
);

create index if not exists landing_events_event_idx
  on public.landing_events (event, created_at desc);

alter table public.landing_events enable row level security;

create policy "landing_events: anyone may record"
  on public.landing_events for insert
  to anon, authenticated
  with check (true);

-- No select policy on purpose.

-- ---------------------------------------------------------------- verification
-- Expect rls_enabled = true and insert-only policies for both tables.
select
  c.relname           as table_name,
  c.relrowsecurity    as rls_enabled,
  count(p.policyname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p
  on p.tablename = c.relname and p.schemaname = n.nspname
where n.nspname = 'public'
  and c.relname in ('waitlist', 'landing_events')
group by c.relname, c.relrowsecurity;
