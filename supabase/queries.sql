-- VibeBox — reporting queries for the demand test
--
-- These are READ-ONLY and safe to run any time. Paste whichever one you need
-- into the Supabase SQL Editor.
--
-- Not to be confused with schema.sql and waitlist.sql, which are DDL and were
-- run once to create the tables. Do not re-run those.
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
-- 2. Willingness to pay
-- ===========================================================================
-- Weaker than a real payment, stronger than a signup alone. "no" answers are
-- the useful ones: they say the thing works but not at a price.
select
  coalesce(would_pay, '(did not answer)') as answer,
  count(*)                                as people,
  round(100.0 * count(*) / sum(count(*)) over (), 1) as pct
from public.waitlist
group by would_pay
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
  (select count(*) from public.waitlist where would_pay = 'yes')           as would_pay_yes,
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
select email, region, would_pay, source, created_at
from public.waitlist
order by created_at desc;
