# 0002 — Pass/fail thresholds for the early-access demand test

**Date:** 2026-08-31
**Status:** Accepted
**Depends on:** [0001](0001-drop-unlicensed-streaming.md)

---

## Context

The landing page at `/early-access` is built, instrumented and committed. No test
has been run. Both `PROJECT_DOCUMENTATION.md` §10 and §11 name this test as the
gate before further building, and neither says what result passes.

A demand test with no threshold set in advance is not a test. Whatever number
arrives will be read as encouraging, because by then the alternative is admitting
that months of work should stop. The threshold is therefore recorded here, before
any data exists, and is not revisable downward once it does.

---

## What this test can and cannot prove

**It can tell us:** whether the pitch, in one paragraph, is enough to make a
stranger hand over an email address.

**It cannot tell us:** whether anyone will pay (nothing is priced, and asking
about price was deliberately removed — see the `usage_intent` migration), whether
anyone returns, whether provider coverage is good enough in practice, or whether
the mood engine works.

Waitlist signups are **medium-strength** evidence at best. A pass means "keep
building, and go get real usage" — not "this is a business."

---

## Traffic warmth

The gate reads **cold traffic only**. A signup from someone who knows you
personally measures politeness, not demand, and pooling the two produces a
flattering number that decides nothing.

Tagging convention, applied when the link is shared:

| Kind | Tag | Counts toward the gate |
|---|---|---|
| Audience that does not know you | `?utm_source=reddit-nollywood`, `?utm_source=x-twitter`, `?utm_source=nairaland` | Yes |
| Your own network, group chats, connections | same name with a `-warm` suffix — `?utm_source=whatsapp-groups-warm`, `?utm_source=linkedin-warm` | No |
| Untagged | `direct` | No |

Warm and direct traffic is still recorded and still worth reading — it is a
sanity check on whether the copy makes sense to anyone at all — but it is not
evidence of demand and cannot move the gate.

---

## Sample and time box

- **100 cold unique visitors** — distinct `session_id` with `event = 'view'` on a
  cold source.
- **21 days** from the first link shared.

Whichever comes first ends the test.

**Failing to reach 100 cold visitors in 21 days is itself a fail.** It means the
distribution problem is larger than the product problem, and no further building
addresses it. That outcome is not a reason to extend the window.

---

## The thresholds

Measured by query §7 in `supabase/queries.sql`.

| Outcome | Condition | Action |
|---|---|---|
| **PASS** | Cold conversion **≥ 10%** **and** **≥ 40%** of signups answer "yes" to weekly use | Proceed. Next work is in-app analytics and getting the waitlist to actually use the product — not new features. |
| **RETRY** (once) | Cold conversion 5–9.9%, **or** conversion ≥ 10% with weekly-use "yes" under 40% | Rewrite the headline and the one-paragraph pitch. Not the product. Re-run on one fresh cold channel for another 100 visitors. **One re-run only.** |
| **FAIL** | Cold conversion **< 5%**, or fewer than 100 cold visitors in 21 days | Stop feature work. Talk to ten people in the target market before writing any more product code. |

Both PASS conditions must hold. High signup with low weekly-use intent is a
RETRY, not a pass: people liked the idea and will not come back, and habit is the
thing that has to be true before anything else is worth building.

The weekly-use figure is measured against **all** cold signups, not only those
who answered. The question is one tap on the confirmation screen; declining it is
itself a weak signal, so non-answers count against.

### Secondary reading, not part of the gate

`explore_click` — someone opening the live app is behaviour rather than stated
intent, and is stronger evidence than an email address. It is excluded from the
gate only because nothing measures what happens after the click; the app has no
analytics (`PROJECT_DOCUMENTATION.md` §11.3). A high click rate alongside low
signup is worth knowing before deciding what to change in a re-run.

---

## Rules that keep this honest

1. The threshold was set before the data. It is not revised after seeing results.
2. Sources are read separately, never pooled. `queries.sql` §1 already does this.
3. Warm and direct traffic never counts toward the gate.
4. The verification-probe rows are deleted (`queries.sql` §0) before the first read.
5. **Read the numbers once, at the end of the window.** Daily checking turns a
   test into a slot machine and invites stopping the moment the figure looks good.
6. A repeat submit from the same address is not a second signup; the unique index
   on `lower(email)` already prevents it.

---

## Prerequisites before the clock starts

Run the preflight query (`queries.sql` §0b) first — every row must read OK. It
checks the pipeline mechanically, because a broken one does not announce itself:
signups keep working while the weekly-use answer is silently dropped, which
reads later as weak demand rather than as a bug.

The test cannot be run until all four are true:

1. The `usage_intent` rename migration is applied to the live database
   (`npm run db:link`, the two `migration repair` calls, `npm run db:push`).
   Until then the habit answer fails with PGRST204 and the second PASS condition
   is unmeasurable.
2. The app is deployed and `/early-access` is reachable at a public URL.
3. All pre-launch rows are deleted. Local QA writes to the production project,
   so every `npm run dev` visit to `/early-access` leaves a real `view` behind.
   `queries.sql` §0 clears everything that exists at the moment you run it,
   which is why it is run immediately before the first link goes out.
4. The share links carry warmth-tagged `utm_source` values.

---

## Consequences

The likely outcome is RETRY or FAIL. Cold consumer waitlists usually convert in
the low single digits, and 0001 already records that the differentiation is thin
and the African-catalogue angle is a hypothesis rather than a moat. Fixing the
number now is what makes that outcome cheap instead of demoralising: stopping
becomes a pre-agreed branch rather than a defeat improvised under pressure.

Nothing about a FAIL invalidates the code. It says the pitch does not survive
contact with strangers, which is a much cheaper thing to learn now than after
another three months of features.

---

## Revisit when

- The test has run. Record the actual numbers and the outcome in a successor
  record, whatever it says.
- The target market changes. These figures are calibrated to cold consumer
  traffic in Nigeria, Cameroon, Ghana, Kenya and the diaspora.

## Do not revisit by

Lowering the number after seeing the data. If 6% looks encouraging in the moment,
it is the RETRY band — and it was the RETRY band before you knew it was 6%.
