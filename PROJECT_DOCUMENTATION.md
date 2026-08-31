# VibeBox — Project Documentation

**Version 2.0** · Updated 2026-08-24
Supersedes v1.0, which documented a streaming architecture that has been removed.
See [docs/decisions/0001-drop-unlicensed-streaming.md](docs/decisions/0001-drop-unlicensed-streaming.md).

---

## 1. What this is

A mood- and time-based discovery layer over the streaming services people already
pay for. You say what you're in the mood for and how long you have; VibeBox
suggests something, then tells you where it is legally available in your region.

**It does not host, stream, proxy or embed video.** The only thing it plays is a
YouTube trailer.

### Core philosophy

The problem is not a shortage of content. It's that finding something worth
watching, across four services, at 11pm, takes longer than the time left to watch
it. VibeBox optimises for *time-to-decision*, not catalogue size.

---

## 2. Value proposition

### The problem

Two things, both real:

1. **Choice paralysis.** Twenty minutes scrolling, nothing chosen.
2. **Fragmentation.** Once you've chosen, "which service has this, here?" is a
   separate search — and in Nigeria, Cameroon, Ghana and Kenya it's a harder one
   than in the US, because coverage differs and the incumbents index it poorly.

### The solution

| Layer | What it does |
|---|---|
| Mood engine | Filters by energy level and available time, not genre |
| Vibe search | Natural language — "something dark but hopeful", "short film under 20 mins" |
| Where-to-watch | Region-aware availability, licensed providers only |
| Curation angle | African and diaspora cinema, where JustWatch/Reelgood coverage is thin |

### Honest assessment of the differentiation

Mood filtering is a UI feature. JustWatch or Reelgood could ship it in a sprint.
The only plausibly defensible position is African and diaspora catalogue
curation — and that is currently a hypothesis with no demand evidence behind it.
Do not treat it as a moat in planning.

---

## 3. Competitive analysis

| Competitor | Core strength | Weakness we might exploit | Reality check |
|---|---|---|---|
| JustWatch | Best-in-class availability data | Thin African coverage; utilitarian UX | They supply *our* data via TMDB |
| Reelgood | Good US aggregation | Barely serves African markets | Could expand if the market proved out |
| Letterboxd | Strong cinephile community | Not an availability tool | Different job entirely |
| Netflix / Prime | Owns the catalogue | Only shows you their own titles | Cross-service view is genuinely useful |
| IROKOTV | Deep Nollywood library | Single-service | A provider we route *to*, not a rival |

We depend on JustWatch data through TMDB. That is a real supply-side dependency
and belongs in risk planning, not competitive strategy.

---

## 4. Current state

**Pre-validation MVP.** Working, deployable, zero users, zero revenue, no demand
testing done.

### Built and working

- TMDB browsing: popular, trending, discover, search, genres, details, cast
- Mood engine and vibe search
- Region-aware where-to-watch with graceful empty states
- Progressive auth (Clerk) — browse anonymously, sign in to save
- Watchlist (localStorage) and recently-viewed (Supabase)
- Accessibility: skip links, high contrast, reduced motion, focus indicators
- Server-side TMDB proxy; no API key in the client bundle
- 85 passing tests

### Known gaps

| Gap | Note |
|---|---|
| Supabase RLS unverified | `WatchHistoryService` filters `user_id` client-side. If RLS is off, that is a live data-exposure bug. |
| Bundle size | 768 kB / 228 kB gzipped, no code splitting |
| Provider coverage | ~60% on sampled Nollywood titles |
| No analytics | Nothing measures whether any of this works |
| 3 pre-existing lint errors | Predate the pivot |

---

## 5. Scope boundaries

### In scope

React 19 + Vite; Vercel edge deployment; TMDB integration through our own proxy;
where-to-watch routing; progressive auth; accessibility; mood and vibe discovery.

### Out of scope

- **Hosting, streaming or embedding video.** Not a resourcing decision — a
  licensing one. See the decision record.
- Building a content library
- Server-side video encoding
- Native mobile apps (web first)
- Affiliate tracking parameters until a programme has actually approved us

### Post-validation, not now

Watch-party sync, social sharing, AI recommendations, multi-language UI. None of
these should be built before demand is demonstrated.

---

## 6. Technical requirements

### Stack

| Layer | Choice | Why |
|---|---|---|
| UI | React 19, Vite 6 | Already in place; fast builds |
| Styling | CSS Modules | No runtime cost, scoped by default |
| Data fetching | React Query + custom hooks | Caching and retry |
| Metadata | TMDB via our edge proxy | Keeps the key server-side |
| Availability | TMDB `/watch/providers` | JustWatch data, free |
| Auth | Clerk | Progressive auth, passkeys, low integration cost |
| Storage | Supabase Postgres | RLS, generous free tier |
| Motion | Framer Motion | Already in place |
| Tests | Vitest + Testing Library | Fast, Vite-native |
| Hosting | Vercel | Edge functions for the proxy |

### Environment variables

```
TMDB_API_KEY=              # server-only, NO Vite prefix
VITE_BASE_IMG_PATH=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLERK_PUBLISHABLE_KEY=
```

`TMDB_API_KEY` must never gain a `VITE_` prefix. Vite inlines every `VITE_*` var
into the browser bundle.

---

## 7. The TMDB proxy

```
browser -> /api/tmdb/movie/550 -> api.themoviedb.org/3/movie/550?api_key=…
```

| Environment | Implementation |
|---|---|
| Production | `api/tmdb/[...path].js` (Vercel edge function) |
| Dev / preview | Middleware in `vite.config.js` |
| Shared | `shared/tmdb-paths.js` — allowlist + URL builder |

Both entry points import the same allowlist so it cannot drift. Design points:

- **Allowlist is deny-by-default.** Without it the endpoint is an open relay to
  any TMDB route, including account and list routes that mutate state.
- **Caller-supplied `api_key` is stripped** and replaced with ours.
- **Edge caching** — `s-maxage=300, stale-while-revalidate=3600`. TMDB data is
  public and slow-moving; this keeps us inside rate limits as traffic grows.

Covered by `src/test/tmdbPaths.test.js`.

---

## 8. Authentication

**Clerk** for identity, **Supabase** for data. Clerk issues the JWT; Supabase
validates it and enforces Row Level Security.

### Progressive auth

1. Browse anonymously — discovery, mood filters, trailers, where-to-watch
2. Auth triggers only on save-to-watchlist
3. One tap: passkey, Google or Apple
4. Clerk handles sessions and suspicious-login detection

Nothing behind the discovery experience requires an account. Sign-in is for
persistence, not access control.

### Schema

```sql
profiles          -- id, clerk_id, email, full_name, avatar_url, plan, created_at
watch_history     -- user_id, movie_id, title, poster_path, updated_at, is_completed
```

`plan` currently only ever reads `free`. There is no paid tier; the column is
retained for a future legitimate one.

> **Open item:** RLS must be enabled on both tables. `WatchHistoryService` filters
> by `user_id` in client code, which is not a security boundary. See §11.

---

## 9. Success metrics

Nothing here is being measured yet. That is the point of the current stage.

### Would indicate the product works

| Metric | Why it matters |
|---|---|
| Provider-link click-through | The core action. If people don't click through, the routing is not useful. |
| Mood-filter → detail-page rate | Does the mood engine actually surface things people want? |
| Empty-state rate | How often we fail to answer "where can I watch this" |
| Return visits within 7 days | Discovery is habitual or it is nothing |

### Technical

Time to interactive under 1.2s, availability lookup under 500ms, Lighthouse
accessibility 90+.

---

## 10. Risk management

| Risk | Impact | Mitigation |
|---|---|---|
| **Nobody wants this** | Existential | Landing page built and instrumented; pass/fail thresholds fixed in [ADR 0002](docs/decisions/0002-demand-test-thresholds.md). Not yet run. |
| Provider coverage gaps | High | Honest empty states; measure the rate; consider supplementing |
| TMDB policy change / JustWatch data withdrawal | High | Single supply dependency. No fallback today. |
| Differentiation copied | High | Only defence is depth in African catalogue curation |
| TMDB rate limits | Medium | Edge caching already in place |
| Supabase RLS misconfigured | Medium | Verify and add a policy test |
| Edge function costs | Low | Caching keeps invocations low at current scale |

---

## 11. Open items

1. **Verify Supabase RLS** on `watch_history` and `profiles`. Highest-priority
   security item.
2. ~~**Rotate the TMDB key.**~~ **Done, 2026-08-31.** The old key had shipped in
   a built bundle before the proxy existed. The replacement is in `.env` and
   verified working against TMDB. Must also be set as `TMDB_API_KEY` in the
   Vercel project before deploying.
3. **Add analytics.** Without click-through data, none of §9 can be answered.
4. **Run the landing-page demand test.** The gating question before further
   building. Thresholds are fixed in
   [ADR 0002](docs/decisions/0002-demand-test-thresholds.md) and read with query
   §7 of `supabase/queries.sql`. Blocked on: the `usage_intent` rename migration
   not yet applied to the live database, and no public deployment.
5. ~~**Code splitting.**~~ **Done, 2026-08-31.** `/early-access` went from
   245 kB to 85 kB of transfer, measured in a browser against a production
   build: routes are lazy, every provider sits behind `AppProviders`, and the
   landing page no longer loads framer-motion (42 kB) or supabase-js (51 kB).
   It mattered because `trackEvent("view")` fires from a `useEffect` and cannot
   run until the bundle has downloaded, so anyone who gave up first was counted
   in neither the numerator nor the denominator of the ADR 0002 gate.
6. Three pre-existing lint errors. *(Now reporting clean — verify and close.)*

---

## 12. Glossary

| Term | Meaning |
|---|---|
| Mood engine | Filtering by energy level and available time rather than genre |
| Vibe search | Natural-language input mapped to mood/tone/duration filters |
| Where-to-watch | Region-scoped licensed availability for a title |
| Watch region | ISO 3166-1 country code scoping availability lookups |
| Progressive auth | Full browsing anonymously; sign-in only to persist |
| Flatrate | Included with a subscription, as opposed to rent or buy |
| RLS | Row Level Security — Postgres per-row access policies |
