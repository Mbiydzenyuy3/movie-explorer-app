# VibeBox

Mood- and time-based movie discovery that tells you **where a title is legally streaming** in your region.

You pick a mood and how long you've got. VibeBox suggests something that fits, then routes you to the service that actually has it — Netflix, Prime, IROKOTV, Apple TV, whatever is live where you are. It does not host or stream video.

Built for viewers in Nigeria, Cameroon, Ghana, Kenya and the diaspora, where "where can I actually watch this" is a harder question than it is in the US.

---

## Status

**Pre-validation MVP.** The app works, but nobody has used it in anger and no demand has been tested. See [docs/decisions/0001-drop-unlicensed-streaming.md](docs/decisions/0001-drop-unlicensed-streaming.md) for why the product changed shape, and what has to be proven before more is built.

---

## Stack

| Layer | Choice |
|---|---|
| UI | React 19, Vite 6, CSS Modules |
| Data | TMDB API via a server-side proxy |
| Availability | TMDB `/watch/providers` (JustWatch data) |
| Auth | Clerk (progressive — browse anonymously, sign in to save) |
| Storage | Supabase Postgres (watchlist, history) |
| Motion | Framer Motion |
| Tests | Vitest + Testing Library |
| Hosting | Vercel (edge function for the TMDB proxy) |

---

## Running it

```bash
npm install
cp .env.example .env    # then fill in the values
npm run dev             # http://localhost:5173
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server, with the TMDB proxy middleware attached |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the build locally, proxy included |
| `npm run test` | Vitest in watch mode |
| `npm run test:run` | Single run |
| `npm run lint` | ESLint |

---

## Environment

```
TMDB_API_KEY=              # server-only. NO Vite prefix — see below
VITE_BASE_IMG_PATH=        # https://image.tmdb.org/t/p/original
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLERK_PUBLISHABLE_KEY=
```

**`TMDB_API_KEY` deliberately has no `VITE_` prefix.** Vite inlines every `VITE_*` variable into the browser bundle. Renaming it back would put the key straight into shipped JavaScript, which is exactly the bug the proxy exists to fix.

The `VITE_`-prefixed values above are all publishable by design — Supabase anon keys and Clerk publishable keys are meant to be client-side, and are gated by Row Level Security and Clerk's own origin checks respectively.

On Vercel, set `TMDB_API_KEY` as a project environment variable.

---

## The TMDB proxy

All TMDB traffic goes through `/api/tmdb/*` so the API key never reaches the browser.

```
browser  ->  /api/tmdb/movie/550       ->  api.themoviedb.org/3/movie/550?api_key=…
```

- **Production:** [`api/tmdb/[...path].js`](api/tmdb/%5B...path%5D.js), a Vercel edge function.
- **Dev & preview:** middleware in [`vite.config.js`](vite.config.js).
- **Shared:** both import the path allowlist from [`shared/tmdb-paths.js`](shared/tmdb-paths.js), so it cannot drift between them.

The allowlist matters: without it the endpoint is an open relay to any TMDB route, including account and list routes that mutate state. A caller-supplied `api_key` parameter is stripped and replaced with ours.

---

## Where-to-watch coverage

Availability comes from TMDB's `/watch/providers`, which is JustWatch data. Coverage is real but incomplete — in a sample of 10 well-known Nollywood titles, **6 had provider data for Nigeria and Cameroon**. The UI treats "no availability listed" as a first-class state rather than an error, because it happens often.

TMDB's terms require attributing this data to JustWatch wherever it is shown. [`WatchProviders.jsx`](src/components/WatchProviders/WatchProviders.jsx) does.

---

## What this app does not do

It does not host, stream, proxy or embed video. Earlier revisions pulled streams from unlicensed aggregators; that was removed in full. If you are re-adding playback, it needs a licensing agreement first — see the decision record.

---

## Running the demand test

The landing page lives at `/early-access`. Tag every link you share so cold
traffic can be told apart from your own network:

```
/early-access?utm_source=whatsapp-groups
/early-access?utm_source=x-twitter
/early-access?utm_source=linkedin
```

### Database changes

Schema lives in `supabase/migrations/` and is applied with the Supabase CLI, so
no copy-pasting into the dashboard.

One-time setup:

```bash
npx supabase login                      # opens a browser, stores an access token
export SUPABASE_PROJECT_REF=<your-ref>  # the subdomain of your project URL
npm run db:link                         # asks for your database password
```

Because the first two migrations were originally applied by hand, tell the CLI
they are already done (once only):

```bash
npx supabase migration repair --status applied 20260825000100
npx supabase migration repair --status applied 20260825000200
```

Then, from now on:

```bash
npm run db:new add_something   # creates a timestamped migration file
npm run db:push                # applies pending migrations
npm run db:status              # shows local vs remote
```

| Path | Purpose |
|---|---|
| `supabase/migrations/` | Schema history. Applied with `npm run db:push`. |
| `supabase/queries.sql` | Read-only reporting. Paste into the SQL Editor. |

The app has no read access to the waitlist: RLS grants anonymous visitors
INSERT but not SELECT, so the email list cannot be pulled from the public API.
Read results in the Supabase SQL Editor, which bypasses RLS.

---

## Layout

```
api/tmdb/[...path].js     Vercel edge proxy (holds the TMDB key)
shared/tmdb-paths.js      Allowlist + URL builder, shared with vite.config.js
src/
  components/             UI, one folder per component + CSS module
    WatchProviders/       Where-to-watch, region-aware
    MoodSelector/         Mood + time filtering
    VibeSearch/           Natural-language mood parsing
  context/                Auth (Clerk), Mood, Movies, Accessibility
  services/               TMDB, watch providers, Supabase, watch history
  lib/region.js           Watch-region detection and persistence
  pages/                  Routed views
  test/                   Vitest suites
docs/decisions/           Architecture decision records
```
