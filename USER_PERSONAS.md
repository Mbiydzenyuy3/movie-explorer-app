# StreamX - User Personas & Product Requirements

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
Loves cinema but hates when apps buffer or "eat" data with unoptimized 4K streams when he only needs 720p.

**Goal**:
A fast, lightweight interface that allows him to see exactly how much data a movie will consume before he hits "Play."

**User Story**:

> "As a data-conscious user, I want to see a Data-Estimate for each quality setting so I can manage my spending while streaming."

**Feature Requirement**:
**Dynamic Quality Selector** - UI element showing "720p (~800MB)" vs "1080p (~1.5GB)"

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

| Persona | Feature                            | Priority |
| ------- | ---------------------------------- | -------- |
| Sarah   | Mood-Sieve Engine                  | P0       |
| Sarah   | Smart-Resume Dashboard             | P0       |
| Kevin   | Dynamic Quality Selector           | P0       |
| Kevin   | Adaptive Bitrate Streaming         | P0       |
| Amara   | Visual Metadata / Aura Collections | P0       |
| All     | Progressive Auth (Clerk)           | P0       |

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

## 4. Adaptive Player Specifications

For Kevin's data-conscious needs:

| Quality  | Resolution | Bitrate  | Est. Data/hr |
| -------- | ---------- | -------- | ------------ |
| Eco      | 480p       | 1 Mbps   | ~450 MB      |
| Standard | 720p       | 2.5 Mbps | ~1.1 GB      |
| High     | 1080p      | 5 Mbps   | ~2.2 GB      |
| Ultra    | 4K         | 15 Mbps  | ~6.7 GB      |

**Smart Start**: Prioritize low-latency start times over high-resolution pre-loading

---

## 5. Smart-Resume Dashboard

Minimalist home screen that puts:

1. **Continue Watching** (top priority)
2. **"Your Current Mood"** - personalized row based on time of day
3. **Quick Picks** - "45 mins or less" shortcuts
4. **New Arrivals** (limited to 5 items)

---

## 6. Performance Guardrails

| Metric              | Target | Rationale                     |
| ------------------- | ------ | ----------------------------- |
| Initial Page Weight | <50KB  | Kevin's data consciousness    |
| Time to Interactive | <1.2s  | Sarah's time constraints      |
| Video Start Time    | <2s    | Kevin's buffering frustration |
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
VITE_CLERK_PUBLISHABLE_KEY=  # Clerk public key
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
