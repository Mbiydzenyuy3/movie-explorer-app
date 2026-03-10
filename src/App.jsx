import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";
import { MoodProvider } from "./context/MoodContext";
import ErrorBoundary from "./components/ErrorCatch/ErrorDisplay";

import Homepage from "./pages/Home";
import DetailPage from "./pages/MovieDetailsPage";
import MoviesPage from "./pages/MoviesPage";
import SeriesPage from "./pages/SeriesPage";
import TrendingPage from "./pages/TrendingPage";
import CategoriesPage from "./pages/CategoriesPage";
import GenrePage from "./pages/GenrePage";

import { DetailMovieData } from "./context/movieContext";

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MoodProvider>
            <DetailMovieData>
              <BrowserRouter>
                <Routes>
                  <Route path='/' element={<Homepage />} />
                  <Route path='/movies' element={<MoviesPage />} />
                  <Route path='/series' element={<SeriesPage />} />
                  <Route path='/trending' element={<TrendingPage />} />
                  <Route path='/categories' element={<CategoriesPage />} />
                  <Route path='/categories/:id' element={<GenrePage />} />
                  <Route path='/details/:id' element={<DetailPage />} />
                </Routes>
              </BrowserRouter>
            </DetailMovieData>
          </MoodProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
