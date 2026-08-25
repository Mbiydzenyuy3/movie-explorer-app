# VibeBox — User Personas & Product Requirements

> **Updated 2026-08-24.** The personas below still hold. The *feature requirements*
> were rewritten after the app stopped streaming video and became a discovery and
> routing product. See [docs/decisions/0001-drop-unlicensed-streaming.md](docs/decisions/0001-drop-unlicensed-streaming.md).

## Executive Summary

This document defines the core user personas and their stories that drive StreamX development. We focus on **relevance and efficiency** over feature bloat, targeting the "Decision-Fatigued" streaming audience of 2026.

---

## 1. User Personas

### A. The "Decision-Fatigued" Professional (High-Value User)

| Attribute        | Details                                                 |
| ---------------- | ------------------------------------------------------- |
| **Name**         | Sarah                                                   |
| **Age**          | 29                                                      |
| **Location**     | Urban center (Yaoundé or Lagos)                         |
| **Tech Profile** | High-end smartphone + Smart TV; stable but metered data |
| **Income**       | Middle-class, pays for streaming subscriptions          |

**Pain Point**:
Finishes work late, has exactly 1 hour before sleep, and spends 20 minutes scrolling Netflix/YouTube without finding anything that fits her "tired but wants to be entertained" mood.

**Goal**:
Wants an app that "understands" her current energy level and suggests a 40-minute episode or a fast-paced movie immediately.

**User Story**:

> "As a tired professional, I want to filter movies by 'Mood' (Relaxing) and 'Time Remaining' (45 mins) so I can start watching instantly without scrolling."

**Feature Requirement**:
**Mood-Sieve Engine** - A dual-slider UI for "Energy Level" and "Available Time"

---

### B. The "Data-Conscious" Student (Growth User)

| Attribute        | Details                                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| **Name**         | Kevin                                                                   |
| **Age**          | 21                                                                      |
| **Location**     | University campus                                                       |
| **Tech Profile** | Mid-range Android device; relies on campus Wi-Fi or limited mobile data |
| **Income**       | Student budget, uses free tiers                                         |

**Pain Point**:
On a metered connection, he does not want to burn data browsing four different apps to find out none of them have the film — or discover after signing up that it isn't available in his country.

**Goal**:
A light, fast interface that answers "can I watch this, here, on something I already have?" before he commits any data to it.

**User Story**:

> "As a data-conscious user, I want to know which service has a film in my country before I open that app, so I don't waste data finding out it isn't there."

**Feature Requirement**:
**Region-accurate where-to-watch** plus a lightweight page. We no longer stream video, so per-quality data estimates no longer apply; the data saving now comes from not making him hunt across apps.

---

### C. The "Indie-Explorer" Cinephile (Loyal User)

| Attribute        | Details                                          |
| ---------------- | ------------------------------------------------ |
| **Name**         | Amara                                            |
| **Age**          | 34                                               |
| **Location**     | Global/Diaspora                                  |
| **Tech Profile** | Desktop-first; uses specialized film forums      |
| **Income**       | Upper-middle class, values quality over quantity |

**Pain Point**:
Tired of mainstream "blockbuster" algorithms. Wants to find hidden gems, local African cinema, or award-winning shorts that aren't buried under "Trending Now."

**Goal**:
A platform that prioritizes artistic "vibes" and curation over raw popularity.

**User Story**:

> "As a cinephile, I want to see curated 'Aura' collections (e.g., 'Neon-Noir' or 'Sahelian Sunset') so I can discover films based on visual style."

**Feature Requirement**:
**Visual Metadata Tagging** - Backend schema supporting "Aesthetic" tags, not just genres

---

### D. The "Casual Browser" (Anonymous User)

| Attribute        | Details        |
| ---------------- | -------------- |
| **Name**         | Guest          |
| **Age**          | 18-45          |
| **Location**     | Anywhere       |
| **Tech Profile** | Any device     |
| **Income**       | Free-tier user |

**Pain Point**:
Doesn't want to create an account just to browse or see trailers.

**Goal**:
Explore content and see trailers without registration friction.

**User Story**:

> "As a modern user, I want to Sign-in with one tap (Passkey/Google) so I don't have to remember another password to access my watchlist."

**Feature Requirement**:
**Progressive Authentication** - Seamless SSO or Biometric login integration

---

## 2. Strategic Feature Mapping

### Core Features (Must-Have)

| Persona | Feature                            | Priority | Status |
| ------- | ---------------------------------- | -------- | ------ |
| Sarah   | Mood-Sieve Engine                  | P0       | Built |
| Sarah   | Recently-viewed dashboard          | P1       | Built (was Smart-Resume) |
| Kevin   | Region-accurate where-to-watch     | P0       | Built |
| Kevin   | Lightweight page weight            | P1       | Not met — 228 kB gzipped |
| Amara   | Visual metadata / Aura collections | P1       | Not built |
| All     | Progressive Auth (Clerk)           | P0       | Built |

Dropped: **Dynamic Quality Selector** and **Adaptive Bitrate Streaming**. Both
assumed we serve the video. We do not.

### Features We Avoid (Out of Scope)

| Feature                 | Reason                                   |
| ----------------------- | ---------------------------------------- |
| Social feeds            | Low usage, high complexity               |
| VR modes                | Niche audience, high dev cost            |
| Complex ratings systems | Overwhelming for decision-fatigued users |
| Live chat               | Not a streaming use case                 |

---

## 3. The "Vibe" Search

A search bar that accepts natural language:

- "Something dark but hopeful"
- "Movie for rainy Sunday"
- "Short film under 20 mins"
- "African indie drama"

### Implementation

```javascript
// Vibe search mapping
const vibeMappings = {
  "dark but hopeful": { mood: "melancholic", tone: "uplifting" },
  "rainy sunday": { mood: "cozy", time: "long" },
  short: { maxDuration: 20 },
  "african indie": { region: "AF", genre: "drama" }
};
```

---

## 4. Where-to-Watch Specification

Availability comes from TMDB's `/watch/providers` endpoint (JustWatch data),
scoped to the viewer's region.

| Element | Behaviour |
|---|---|
| Region | Detected from browser locale, user-overridable, persisted in `localStorage` |
| Grouping | Included with subscription / Rent / Buy |
| Links | TMDB-supplied JustWatch deep link, used as-is — no affiliate parameters until a programme approves us |
| Attribution | "Availability data by JustWatch", required by TMDB's terms |

### The empty state is a primary case, not an error

In a sample of 10 well-known Nollywood titles, **6 had provider data for Nigeria
and Cameroon**. Roughly 4 in 10 lookups return nothing. The UI says so plainly and
offers a region switch, rather than presenting it as a failure.

This is the honest ceiling on Amara's and Kevin's experience today, and the rate
should be measured rather than hidden.

---

## 5. Smart-Resume Dashboard

Minimalist home screen that puts:

1. **Recently viewed** (top priority — was "Continue Watching"; there is no
   playback to resume, so this now tracks titles you looked at)
2. **"Your Current Mood"** - personalized row based on time of day
3. **Quick Picks** - "45 mins or less" shortcuts
4. **New Arrivals** (limited to 5 items)

---

## 6. Performance Guardrails

| Metric              | Target | Rationale                     |
| ------------------- | ------ | ----------------------------- |
| Initial Page Weight | <50KB  | Kevin's data consciousness    |
| Time to Interactive | <1.2s  | Sarah's time constraints      |
| Availability lookup | <500ms | Answers Kevin's question before he opens another app |
| API Response        | <200ms | Smooth browsing               |

---

## 7. Authentication Flow (Clerk)

### Progressive Auth Strategy

1. **Browse Anonymously**: All users can explore mood filters & trailers
2. **Trigger Login**: On "Play" or "Save to Watchlist"
3. **One-Tap Auth**: Passkey, Google, or Apple Sign-In
4. **Session Security**: Clerk handles suspicious session detection

### Clerk Integration

```
VITE_CLERK_PUBLISHABLE_KEY=  # Clerk publishable key (client-side by design)
```

---

## 8. Database Schema (Supabase PostgreSQL)

```sql
-- Profiles (synced with Clerk)
profiles:
  - id: uuid (PK, FK to auth.users)
  - clerk_id: string (unique)
  - email: string
  - full_name: string
  - avatar_url: string
  - plan: enum ('free', 'pro')
  - created_at: timestamptz

-- Watchlist
watchlist:
  - id: uuid (PK)
  - user_id: uuid (FK to profiles)
  - movie_id: string
  - added_at: timestamptz

-- User Preferences (Mood Engine)
user_preferences:
  - id: uuid (PK)
  - user_id: uuid (FK to profiles)
  - preferred_genres: jsonb
  - mood_history: jsonb
  - region: string
  - data_saver: boolean

-- Aesthetic Tags
aesthetic_tags:
  - id: uuid (PK)
  - name: string (e.g., 'Neon-Noir', 'Sahelian Sunset')
  - description: text
  - color_hex: string
```

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Status**: Approved for Development
