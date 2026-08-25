# 0001 — Drop in-app streaming; become a discovery and routing product

**Date:** 2026-08-24
**Status:** Accepted
**Supersedes:** `implementation_plan.md` (the "VibeBox Upgrades & Monetization" plan, 2026-03-24)

---

## Context

Between 2026-03-10 and 2026-03-24 the app grew an in-app player that streamed full
movies and TV episodes. The content came from three places:

| Source | What it is |
|---|---|
| `api.consumet.org` | Open-source scraper that pulls streams from pirate sites |
| `vidsrc.rip`, `vidsrc.me` | Pirate embed providers |
| `flixhq`, `vidcloud`, `upcloud`, `vidplay` | Pirate streaming hosts, selected by provider priority |

TMDB supplies metadata and YouTube trailer keys. It does not supply films. Every
full-length stream in the app came from an unlicensed source.

On top of that sat an ad banner, affiliate buttons, and a `/upgrade` page selling
"VibeBox Pro" at $9.99/mo for "access to full library", 4K, and offline downloads.

### What made this decisive

**1. The supply was already gone.** Checked 2026-08-24:

- `api.consumet.org` 301-redirects to its GitHub repo, which returns **HTTP 451,
  "Unavailable For Legal Reasons"**. Every call in `streaming-service.js` returned
  `null`.
- `vidsrc.rip` resolves but refuses connections.
- `vidsrc.me` redirects to `vidsrcme.ru`, matching the reported pattern of VidSrc
  regenerating on Russian domains after a global injunction obtained by the MPA,
  ACE and COA.

In-app playback had not worked for some time.

**2. The monetization could not be built.** Independent of the law:

- No payment processor (Stripe, Paddle, Flutterwave, Paystack) onboards merchants
  distributing infringing content, so the Pro tier could never collect.
- No ad network (AdSense, Ezoic, Media.net) serves infringing content.
- Amazon Associates' operating agreement excludes such sites, so the affiliate
  path earned nothing — the links carried no tracking parameters in any case.

A subscription business that cannot take subscriptions is not a business.

**3. Ads plus a paid tier is the aggravating factor.** Non-commercial hobby
scraping and ad-supported, subscription-monetized distribution are treated very
differently. The monetization layer converted a portfolio project into something
much riskier while generating zero revenue.

---

## Decision

Remove the unlicensed streaming layer entirely and reposition around the part that
was always legitimate: **helping someone decide what to watch, then routing them to
a licensed provider.**

### Removed

`services/streaming-service.js`, `components/Shorts/`, `components/HLSPlayer/`,
`components/VideoPlayer/`, `components/Monetization/AdBanner`, `pages/UpgradePage`
and its route, `lib/encryption.js`, and the `hls.js` dependency. About 4,500 lines.

### Kept

TMDB discovery, the Mood/Vibe engine, the personas, accessibility work, Clerk
progressive auth, Supabase watchlist, and the UI.

### Added

`WatchProviders` — region-aware availability from TMDB `/watch/providers`
(JustWatch data), with JustWatch attribution as TMDB's terms require.

---

## Consequences

**Lost:** in-app playback. It did not function, and it was what made the business
unbuildable, but it was the headline feature in every prior planning document.

**Gained:** a product that can legally take payment, and provider links that do not
depend on infrastructure designed to be seized.

**New weakness:** availability data is incomplete. In a sample of 10 well-known
Nollywood titles, 6 had provider data for Nigeria and Cameroon. The empty state is
a first-class UI case, not an error path. This is the honest ceiling on the
experience and should be measured, not hidden.

**Unresolved:** "Continue Watching" on the home dashboard lost its writer when the
player was removed. It is now populated as *recently viewed* instead. See
`WatchHistoryService` and `Home.jsx`.

**Differentiation is thin.** Mood filtering is a UI feature that JustWatch and
Reelgood can copy in a sprint. The defensible angle, if one exists, is African and
diaspora catalogue curation where the incumbents have poor coverage. That is a
hypothesis, not a moat.

---

## Revisit this when

- A licensing agreement with an actual rights holder is on the table. Then in-app
  playback becomes a legitimate engineering question again — DRM, CDN, geo-fencing,
  cost per stream.
- TMDB provider coverage for African regions improves or degrades materially.
- Demand testing shows people want playback more than they want routing.

## Do not revisit by

Re-adding a scraper. The removal was not a technical judgement about code quality;
adding it back reintroduces every problem above, all of which are still true.
