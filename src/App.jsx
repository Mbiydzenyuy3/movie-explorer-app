import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
// The /react entries, not /next — Vercel's setup pages show the Next.js
// imports, which do not resolve in a Vite build.
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ErrorBoundary from "./components/ErrorCatch/ErrorDisplay";

// Routes are loaded on demand so that a visitor only downloads the page they
// asked for. /early-access is deliberately outside AppProviders: it is the
// cold-traffic landing page for the demand test, and every kilobyte it does
// not need is one fewer reason for someone on mobile data to leave before the
// page appears. See docs/decisions/0002-demand-test-thresholds.md.
const EarlyAccessPage = lazy(() => import("./pages/EarlyAccessPage"));
const AppProviders = lazy(() => import("./AppProviders"));

const Homepage = lazy(() => import("./pages/Home"));
const DetailPage = lazy(() => import("./pages/MovieDetailsPage"));
const MoviesPage = lazy(() => import("./pages/MoviesPage"));
const SeriesPage = lazy(() => import("./pages/SeriesPage"));
const TrendingPage = lazy(() => import("./pages/TrendingPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const GenrePage = lazy(() => import("./pages/GenrePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage"));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path='/early-access' element={<EarlyAccessPage />} />

            {/* Pathless layout route: absolute paths are unchanged, but every
                page below it now loads behind the provider chunk. */}
            <Route element={<AppProviders />}>
              <Route path='/' element={<Homepage />} />
              <Route path='/movies' element={<MoviesPage />} />
              <Route path='/series' element={<SeriesPage />} />
              <Route path='/trending' element={<TrendingPage />} />
              <Route path='/categories' element={<CategoriesPage />} />
              <Route path='/categories/:id' element={<GenrePage />} />
              <Route path='/details/:id' element={<DetailPage />} />
              <Route path='/search' element={<SearchPage />} />
              <Route path='/watchlist' element={<WatchlistPage />} />
            </Route>
          </Routes>
        </Suspense>

        {/* Page views for the whole app, which otherwise measures nothing —
            PROJECT_DOCUMENTATION.md §11.3. It does NOT replace landing_events:
            the demand test in ADR 0002 is decided from Supabase, and this is a
            second, independent count. If the two disagree badly, our own
            tracking is wrong, which is worth knowing before trusting it for
            21 days. Cookieless, so no consent banner. */}
        <Analytics />

        {/* Real load times from real visitors' devices, rather than from a
            laptop on home broadband. The landing page was cut from 245 kB to
            85 kB for people on mobile data in Nigeria, Cameroon, Ghana and
            Kenya; this is the only way to find out whether that actually
            reached them. Note the per-country breakdown is a paid feature —
            the free view splits desktop from mobile, which is still the split
            that matters here. */}
        <SpeedInsights />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
