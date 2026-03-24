import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";
import { MoodProvider } from "./context/MoodContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import ErrorBoundary from "./components/ErrorCatch/ErrorDisplay";
import SkipLink from "./components/SkipLink/SkipLink";

import Homepage from "./pages/Home";
import DetailPage from "./pages/MovieDetailsPage";
import MoviesPage from "./pages/MoviesPage";
import SeriesPage from "./pages/SeriesPage";
import TrendingPage from "./pages/TrendingPage";
import CategoriesPage from "./pages/CategoriesPage";
import GenrePage from "./pages/GenrePage";
import SearchPage from "./pages/SearchPage";
import WatchlistPage from "./pages/WatchlistPage";

import { DetailMovieData } from "./context/movieContext";
import { useSyncUser } from "./services/userService";

const UserSyncWrapper = ({ children }) => {
  useSyncUser();
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserSyncWrapper>
            <MoodProvider>
              <AccessibilityProvider>
                <SkipLink />
                <DetailMovieData>
                  <BrowserRouter>
                    <main id='main-content' tabIndex={-1}>
                      <Routes>
                        <Route path='/' element={<Homepage />} />
                        <Route path='/movies' element={<MoviesPage />} />
                        <Route path='/series' element={<SeriesPage />} />
                        <Route path='/trending' element={<TrendingPage />} />
                        <Route path='/categories' element={<CategoriesPage />} />
                        <Route path='/categories/:id' element={<GenrePage />} />
                        <Route path='/details/:id' element={<DetailPage />} />
                        <Route path='/search' element={<SearchPage />} />
                        <Route path='/watchlist' element={<WatchlistPage />} />
                      </Routes>
                    </main>
                  </BrowserRouter>
                </DetailMovieData>
              </AccessibilityProvider>
            </MoodProvider>
          </UserSyncWrapper>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
