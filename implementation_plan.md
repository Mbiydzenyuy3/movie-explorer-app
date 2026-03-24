# VibeBox Upgrades & Monetization Implementation Plan

## Goal Description
Transform the current "Movie Explorer App" into **VibeBox**—a context-aware streaming platform designed to solve "Subscription Fatigue" and implement a hybrid monetization strategy. This upgrade introduces Clerk + Supabase for secure Auth and data storage, premium UX enhancements (Mood Engine, Data-Conscious Player), and Vercel edge proxies for API security.

## User Review Required
> [!IMPORTANT]
> - Do you have a preferred UI framework/library (e.g., Tailwind CSS, Framer Motion) for the premium visual upgrades, or should I proceed with the existing CSS approach?
> - Please provide your Supabase URL/Anon Key and Clerk Publishable Key in the [.env](file:///home/leila/Desktop/movie-explorer-app/.env) file whenever you are ready.

## Proposed Changes

### 1. Infrastructure & Monetization Layer

#### [MODIFY] [package.json](file:///home/leila/Desktop/movie-explorer-app/package.json)
- Install `@clerk/clerk-react` and `@supabase/supabase-js` for the Progressive Authentication Strategy and Database tracking.

#### [NEW] `src/services/supabaseClient.js`
- Initialize Supabase connection for the `profiles`, `watchlist`, and `user_preferences` tables.

#### [MODIFY] [src/context/AuthContext.jsx](file:///home/leila/Desktop/movie-explorer-app/src/context/AuthContext.jsx)
- Replace boilerplate custom auth with `ClerkProvider` and sync session tokens securely to the Supabase client.

#### [NEW] `api/tmdb-proxy.js`
- Vercel Serverless/Edge Function to proxy requests strictly from the backend, shielding `VITE_API_KEY`.

---

### 2. Core UX/UI Transformation & Monetization UI

#### [MODIFY] `src/components/MoodSelector` & `src/components/VibeSearch`
- Implement the "Mood-Sieve Engine" using premium, glassmorphism design.
- Accept natural language or dual-slider mappings for Energy Level and Time Remaining.

#### [MODIFY] `src/pages/Home.jsx`
- Replace default layout with the **Smart-Resume Dashboard**, prioritizing "Continue Watching", "Your Current Mood", and quick picks.

#### [NEW] `src/components/Monetization/AdBanner.jsx` & `AffiliateLink.jsx`
- Implement ad spaces for free tier users and affiliate ("Watch on Amazon") actions.

---

### 3. Video Player & Streaming Upgrades

#### [MODIFY] `src/components/HLSPlayer`
- Add a **Dynamic Quality Selector** per Kevin's user persona: showing data estimates (`Eco 480p (~450 MB)` vs `Ultra 4K (~6.7 GB)`).
- Provide fallback latency optimizations.

## Verification Plan

### Automated Tests
- Run `npm run test` or `vitest` to ensure context providers and pure utility mappings (like VibeSearch string parsers) do not regress.
- Implement new E2E/component testing using `@testing-library/react` for the new `MoodSelector` and Auth wrappers.

### Manual Verification
1. **Authentication Flow**: Click "Save to Watchlist", observe Clerk login prompt, authenticate, and verify data persists in Supabase.
2. **Proxy Validation**: Inspect network payload in browser dev tools to confirm TMDB calls are hitting `/api/tmdb-proxy` instead of `api.themoviedb.org` directly.
3. **Accessibility**: Run Lighthouse accessibility check (targeting 90+ scope) and perform keyboard navigation on the Smart-Resume Dashboard.
