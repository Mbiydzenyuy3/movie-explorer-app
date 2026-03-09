# VibeBox - Context-Aware Streaming Platform

## Project Documentation v1.0

---

## 1. Project Vision

Transform the Movie Explorer app into **VibeBox**, a profitable, modern streaming platform that solves "Subscription Fatigue" and "Choice Paralysis" through **Context-Aware Streaming**.

### Core Philosophy

- **"Lean but Lethal"**: Compete with billion-dollar infrastructures using optimized, modern web technologies
- **Premium FAST**: A free-tier app that feels like a $20/month luxury experience
- **Universal Curation**: Act as the "smart layer" that aggregates where to watch

---

## 2. Unique Value Proposition (UVP)

### The Problem

In 2026, users spend an average of **19 minutes** just trying to pick a movie.

### Our Solution: "Context-Aware Streaming"

| Feature                   | Description                                                                      |
| ------------------------- | -------------------------------------------------------------------------------- |
| **Atmospheric Discovery** | Instead of standard grids, use mood-based exploration                            |
| **Mood-Based Filters**    | "I have 40 minutes, I'm feeling stressed, and I want something visually vibrant" |
| **Hyper-Local Relevance** | Prioritize regional content (Nollywood, Lazizi) for African markets              |
| **Hybrid Feed**           | Mix high-quality indie trailers with short-form "behind-the-scenes" content      |

---

## 3. Competitive Analysis

### Competitor Matrix

| Competitor        | Core Strength          | 2026 Pain Point        | Our Opportunity          |
| ----------------- | ---------------------- | ---------------------- | ------------------------ |
| Netflix/Disney+   | Massive IP libraries   | Content Fragmentation  | Universal Curation layer |
| YouTube/TikTok    | Creator-led short-form | Low Cinematic Quality  | Premium hybrid feed      |
| Pluto/Tubi (FAST) | Free ad-supported      | Poor UX & High Latency | Premium FAST experience  |

---

## 4. Development Phases

### Phase 1: Foundation & Infrastructure ⚡

**Goal**: Build the technical foundation for performance, security, and scalability

| Task                    | Priority | Description                                 |
| ----------------------- | -------- | ------------------------------------------- |
| Edge Functions Setup    | P0       | Move data fetching to Vercel Edge Functions |
| API Proxy Layer         | P0       | Hide TMDB API keys server-side              |
| React Query Integration | P0       | Implement caching to reduce API calls       |
| JWT Authentication      | P0       | Zero-trust auth with short-lived tokens     |
| Error Handling System   | P1       | Global error boundaries and fallback UI     |

**Success Metrics**:

- Time to Interactive < 1.2s
- Zero API key exposure in client

---

### Phase 2: Core UX/UI Transformation 🎨

**Goal**: Implement the unique value proposition features

| Task                      | Priority | Description                                  |
| ------------------------- | -------- | -------------------------------------------- |
| Mood-Based Discovery      | P0       | New discovery engine based on user mood/time |
| Regional Content Priority | P0       | Hyper-local content for African markets      |
| Atmospheric Hero Section  | P1       | Dynamic backgrounds based on mood/content    |
| Enhanced Search           | P1       | "Watch on Amazon" affiliate links            |
| Hybrid Feed System        | P2       | Short-form + long-form content mix           |

**Success Metrics**:

- User time-to-decision < 5 minutes
- Regional content visibility increased 300%

---

### Phase 3: Video Player & Streaming 🎬

**Goal**: Premium streaming experience with ABR

| Task                | Priority | Description                            |
| ------------------- | -------- | -------------------------------------- |
| Custom Video Player | P0       | Build proprietary player wrapper       |
| HLS Integration     | P0       | Adaptive bitrate streaming             |
| Video Encryption    | P1       | AES-128 segment encryption             |
| Multi-Audio Tracks  | P1       | Audio descriptions, multiple languages |
| Offline Downloads   | P2       | Pro tier feature                       |

**Success Metrics**:

- Zero buffering on 4G connections
- Piracy reduction via encryption

---

### Phase 4: Accessibility & Navigation ♿

**Goal**: WCAG 2.1 AA compliance

| Task                       | Priority | Description                       |
| -------------------------- | -------- | --------------------------------- |
| Keyboard Navigation        | P0       | Full D-pad/keyboard support       |
| Screen Reader Optimization | P0       | ARIA labels, live regions         |
| Focus Management           | P0       | Visible focus indicators          |
| Audio Descriptions         | P1       | Default multi-track audio support |
| High Contrast Mode         | P2       | Accessibility preferences         |

**Success Metrics**:

- WCAG 2.1 AA compliance
- Full navigability without mouse/touch

---

### Phase 5: Monetization Infrastructure 💰

**Goal**: Hybrid monetization model

| Task                  | Priority | Description                         |
| --------------------- | -------- | ----------------------------------- |
| User Accounts System  | P0       | Registration, profiles, preferences |
| Watchlist Sync        | P0       | Server-side watchlist persistence   |
| Ad Integration        | P1       | Pre-roll ads for free tier          |
| Sponsor Spotlight     | P1       | Pinned sponsored content            |
| Affiliate Links       | P1       | "Watch on Amazon" integration       |
| Tiered Access Control | P2       | Free (720p) vs Pro (4K) tiers       |

**Revenue Streams**:

- Free: 720p + Discovery ads
- Pro: 4K + Offline + Watch Party sync
- Sponsorships: Local business featured content
- Affiliate: 5-10% referral on external streams

---

### Phase 6: Performance Optimization 🚀

**Goal**: Premium feel with minimal resources

| Task               | Priority | Description                  |
| ------------------ | -------- | ---------------------------- |
| Image Optimization | P0       | WebP/AVIF with lazy loading  |
| Code Splitting     | P0       | Route-based code splitting   |
| Prefetching        | P1       | Predict next content to load |
| Service Worker     | P1       | Offline capability for Pro   |
| Edge CDN           | P2       | Global content delivery      |

---

## 5. Scope Boundaries

### IN SCOPE ✅

- React 19 + Vite architecture
- Vercel Edge deployment
- TMDB API integration
- Custom streaming player
- User authentication
- Affiliate/Ad systems
- Accessibility compliance

### OUT OF SCOPE ❌

- Building own content library (use TMDB)
- Server-side video encoding
- Payment processing (use Stripe/PayPal)
- Mobile apps (focus on web PWA)
- Live streaming capabilities

### NICE TO HAVE (Post-MVP)

- Watch Party sync feature
- Social sharing
- AI-powered recommendations
- Podcast/audio content
- Multi-language UI

---

## 6. Technical Requirements

### Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Framework  | React 19 + Vite             |
| Routing    | React Router v7             |
| State      | React Query + Context       |
| Styling    | CSS Modules + CSS Variables |
| Deployment | Vercel (Edge Functions)     |
| Auth       | JWT with refresh tokens     |
| Streaming  | HLS.js + Video.js           |

### Environment Variables

```
VITE_API_KEY=                    # TMDB API Key (via proxy only)
VITE_BASE_URL=                   # TMDB Base URL (via proxy)
VITE_JWT_SECRET=                # Auth secret
VITE_AD_CLIENT=                 # Ad integration ID
VITE_AFFILIATE_API=             # Amazon affiliate API
```

---

## 7. Success Metrics

### Performance

- [ ] Time to Interactive < 1.2s
- [ ] First Contentful Paint < 1.5s
- [ ] Lighthouse Score > 90

### Business

- [ ] User registration > 10,000
- [ ] Pro conversion rate > 5%
- [ ] Average session time > 15 minutes

### Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard-only navigation functional
- [ ] Screen reader compatible

### Technical

- [ ] Zero API key exposure
- [ ] Zero critical security vulnerabilities
- [ ] 99.9% uptime

---

## 8. Development Guidelines

### Code Standards

1. **Always** use functional components with hooks
2. **Always** implement proper TypeScript types (or PropTypes)
3. **Never** expose API keys in client code
4. **Always** implement error boundaries
5. **Always** add ARIA labels to interactive elements

### Git Workflow

```
main → develop → feature/xxx → PR → merge
```

### Testing Requirements

- Unit tests for utilities
- Component tests for key UI
- E2E tests for critical flows

---

## 9. File Structure (Target)

```
src/
├── api/                    # Edge function proxies
│   ├── movies.js
│   ├── auth.js
│   └── affiliate.js
├── components/
│   ├── common/            # Shared UI components
│   ├── discovery/        # Mood-based discovery
│   ├── player/           # Video player components
│   └── layout/           # Layout components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── pages/                 # Route pages
├── services/              # API services
├── styles/                # Global styles
├── utils/                 # Helper functions
└── App.jsx               # Root component
```

---

## 10. Roadmap

```
Q1 2026
├── Phase 1: Foundation
│   ├── Edge Functions setup
│   ├── API Proxy layer
│   └── React Query integration

Q2 2026
├── Phase 2: UX Transformation
│   ├── Mood-based discovery
│   ├── Regional prioritization
│   └── Enhanced search
├── Phase 3: Video Player
│   ├── Custom player build
│   └── HLS integration

Q3 2026
├── Phase 4: Accessibility
│   ├── Keyboard navigation
│   ├── Screen reader support
│   └── WCAG compliance
├── Phase 5: Monetization
│   ├── User accounts
│   ├── Ad integration
│   └── Tiered access

Q4 2026
├── Phase 6: Optimization
│   ├── Performance tuning
│   ├── Offline capabilities
│   └── PWA features
```

---

## 11. Risk Management

| Risk                   | Impact | Mitigation                              |
| ---------------------- | ------ | --------------------------------------- |
| API rate limits        | High   | Aggressive caching, queue requests      |
| TMDB policy changes    | High   | Abstract API layer, plan for migration  |
| Ad revenue variability | Medium | Diversify with affiliate + sponsorships |
| Edge function costs    | Medium | Implement request limiting              |
| Browser compatibility  | Low    | Progressive enhancement                 |

---

## 12. Authentication Strategy (Clerk + Supabase)

### Authentication Provider: Clerk

We use **Clerk** for authentication for these reasons:

| Feature             | Clerk                     | Supabase Auth |
| ------------------- | ------------------------- | ------------- |
| Passkeys/Biometrics | Native                    | Limited       |
| Session Security    | Advanced threat detection | Basic         |
| Social Login        | One-tap Google/Apple      | Available     |

**Why Clerk?**

- Security: Session management protects accounts on public Wi-Fi
- Performance: Lighter client-side footprint

### Progressive Auth Flow

1. **Browse Anonymously**: Explore mood filters & trailers
2. **Trigger Login**: On "Play" or "Save to Watchlist"
3. **One-Tap Auth**: Passkey, Google, or Apple
4. **Session Security**: Clerk handles suspicious sessions

### Environment Variables

```
VITE_CLERK_PUBLISHABLE_KEY=   # Clerk key
VITE_SUPABASE_URL=             # Supabase URL
VITE_SUPABASE_ANON_KEY=       # Supabase anon key
```

### Database: Supabase PostgreSQL (Data Only)

For a streaming app, authentication is mandatory for three reasons:

| Reason                     | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| **Personalization**        | "Mood-First" engine requires knowing whose mood to track   |
| **Profitability**          | Link payment/subscription to specific user                 |
| **Security (Anti-Piracy)** | JWT authorization for video segments prevents stream theft |

### Industry Standards (2026)

| Platform    | Auth Method                                        |
| ----------- | -------------------------------------------------- |
| Netflix     | IP + Device Fingerprinting, 2FA verification codes |
| Disney+     | Passkeys (FIDO2) - FaceID/Fingerprint login        |
| Modern Apps | SSO (Google/Apple/GitHub), Magic Links             |

### Our Strategy: Progressive Auth

We implement a "hook-first" approach to maximize conversion:

1. **Browse Anonymously**: Users explore mood filters & trailers without login
2. **Magic Link/Passkey**: Triggered on "Play" or "Save to Watchlist"
3. **Session Management**: Supabase handles suspicious session logout

### Supabase Implementation

| Feature      | Implementation        |
| ------------ | --------------------- |
| Provider     | Supabase Auth         |
| Database     | Supabase PostgreSQL   |
| Passwordless | Magic Link + Passkeys |
| Session      | JWT with auto-refresh |

### Database Schema

```sql
profiles:
  - id: uuid (FK to auth.users)
  - email, full_name, avatar_url
  - plan: enum ('free', 'pro')

watchlist:
  - user_id, movie_id, created_at

user_preferences:
  - preferred_genres, mood_history, region
```

---

## 13. Glossary

| Term | Definition                           |
| ---- | ------------------------------------ |
| FAST | Free Ad-Supported Television         |
| AVOD | Ad-Supported Video on Demand         |
| ABR  | Adaptive Bitrate Streaming           |
| HLS  | HTTP Live Streaming                  |
| WCAG | Web Content Accessibility Guidelines |
| JWT  | JSON Web Token                       |
| Edge | CDN-edge compute for low-latency     |

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Status**: Approved for Development
