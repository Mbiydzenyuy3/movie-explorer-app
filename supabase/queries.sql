-- VibeBox — reporting queries for the demand test
--
-- These are READ-ONLY and safe to run any time. Paste whichever one you need
-- into the Supabase SQL Editor.
--
-- Not to be confused with supabase/migrations/, which is DDL and is applied
-- with `npm run db:push`. This file is reporting only.
--
-- The app has no SELECT access to these tables by design: RLS grants anonymous
-- visitors INSERT only, so the email list cannot be read from the public API.
-- The dashboard uses a privileged connection and bypasses RLS, which is why
-- these work here and nowhere else.

-- ===========================================================================
-- 0. ONE-TIME CLEANUP — remove verification rows before counting anything
-- ===========================================================================
-- These rows were created while testing that the tables worked. Delete them
-- once, then never again.
--
--   delete from public.waitlist
--   where source = 'verification-probe' or email like 'e2e-%@example.com';
--
--   delete from public.landing_events where source = 'verification-probe';
--
-- Left commented out on purpose: this file should stay safe to run whole.


-- ===========================================================================
-- 1. THE NUMBER THAT DECIDES THINGS — conversion by traffic source
-- ===========================================================================
-- Read the sources separately. A signup from someone who knows you is much
-- weaker evidence than one from a stranger, and lumping them together produces
-- a flattering number that means nothing.
select
  e.source,
  count(*) filter (where e.event = 'view')                        as views,
  count(distinct e.session_id) filter (where e.event = 'view')    as unique_visitors,
  count(*) filter (where e.event = 'signup')                      as signups,
  count(*) filter (where e.event = 'explore_click')               as tried_the_app,
  round(
    100.0 * count(*) filter (where e.event = 'signup')
    / nullif(count(distinct e.session_id) filter (where e.event = 'view'), 0),
    1
  ) as conversion_pct
from public.landing_events e
group by e.source
order by views desc;


-- ===========================================================================
-- 2. Would they use it weekly? (habit intent)
-- ===========================================================================
-- Habit is what has to be true before any price can be set. "Probably not"
-- answers are the useful ones: they liked the pitch but not enough to return.
select
  coalesce(usage_intent, '(did not answer)') as answer,
  count(*)                                as people,
  round(100.0 * count(*) / sum(count(*)) over (), 1) as pct
from public.waitlist
group by usage_intent
order by people desc;


-- ===========================================================================
-- 3. Which markets the interest came from
-- ===========================================================================
-- Region is inferred from the browser, so treat it as a hint, not a fact.
-- If interest is overwhelmingly non-African, the positioning is not landing
-- with the audience it was written for.
select
  coalesce(region, '(unknown)') as region,
  count(*)                      as signups
from public.waitlist
group by region
order by signups desc;


-- ===========================================================================
-- 4. Signups over time — is interest sustained or one spike?
-- ===========================================================================
-- One good day from a single post is not demand. Look for whether anything
-- arrives after the initial push.
select
  date_trunc('day', created_at)::date as day,
  source,
  count(*)                            as signups
from public.waitlist
group by day, source
order by day desc, signups desc;


-- ===========================================================================
-- 5. Headline summary
-- ===========================================================================
select
  (select count(*) from public.waitlist)                                   as total_signups,
  (select count(*) from public.waitlist where usage_intent = 'yes')           as usage_intent_yes,
  (select count(distinct session_id) from public.landing_events
     where event = 'view')                                                 as unique_visitors,
  (select count(*) from public.landing_events where event = 'explore_click') as clicked_into_app,
  round(
    100.0 * (select count(*) from public.landing_events where event = 'signup')
    / nullif((select count(distinct session_id) from public.landing_events
              where event = 'view'), 0),
    1
  ) as overall_conversion_pct;


-- ===========================================================================
-- 6. The actual list, when you are ready to email people
-- ===========================================================================
select email, region, usage_intent, source, created_at
from public.waitlist
order by created_at desc;

-- ===========================================================================
-- 7. THE GATE — the pass/fail decision from ADR 0002
-- ===========================================================================
-- docs/decisions/0002-demand-test-thresholds.md. The thresholds below were
-- fixed before any data was collected and are not to be lowered afterwards.
--
-- Cold traffic only. A source is COLD unless it is 'direct' or carries a
-- '-warm' suffix, which is how links shared into your own network are tagged.
-- Warm signups measure politeness, not demand.
--
-- weekly_yes_pct is measured against ALL cold signups, not only those who
-- answered. The follow-up is one tap on the confirmation screen; skipping it
-- is itself a weak signal, so non-answers count against.
--
-- If 21 days have passed since the first link was shared and this still
-- reports INCOMPLETE, the verdict is FAIL: the distribution problem is bigger
-- than the product problem. Do not extend the window.
with cold_events as (
  select *
  from public.landing_events
  where source is not null
    and source <> 'direct'
    and source not like '%-warm'
),
cold_signups as (
  select *
  from public.waitlist
  where source is not null
    and source <> 'direct'
    and source not like '%-warm'
),
m as (
  select
    (select count(distinct session_id) from cold_events where event = 'view')  as cold_visitors,
    (select count(*) from cold_events where event = 'explore_click')           as opened_the_app,
    (select count(*) from cold_signups)                                        as signups,
    (select count(*) from cold_signups where usage_intent = 'yes')             as weekly_yes,
    (select count(*) from cold_signups where usage_intent is not null)         as answered_the_question
)
select
  cold_visitors,
  signups,
  round(100.0 * signups / nullif(cold_visitors, 0), 1)  as conversion_pct,      -- gate: >= 10
  weekly_yes,
  round(100.0 * weekly_yes / nullif(signups, 0), 1)     as weekly_yes_pct,      -- gate: >= 40
  answered_the_question,
  opened_the_app,                                                               -- context, not a gate
  case
    when cold_visitors < 100
      then 'INCOMPLETE — under 100 cold visitors (FAIL if 21 days are up)'
    when 100.0 * signups / cold_visitors >= 10
     and 100.0 * weekly_yes / nullif(signups, 0) >= 40
      then 'PASS — proceed; next work is in-app analytics, not features'
    when 100.0 * signups / cold_visitors < 5
      then 'FAIL — stop feature work, go and talk to ten people'
    else 'RETRY (once) — rewrite the pitch, not the product'
  end as verdict
from m;
