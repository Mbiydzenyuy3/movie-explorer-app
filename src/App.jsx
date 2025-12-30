import { BrowserRouter, Routes, Route } from "react-router";
import Homepage from "./pages/Home";
import DetailPage from "./pages/MovieDetailsPage";
import MoviesPage from "./pages/MoviesPage";
import SeriesPage from "./pages/SeriesPage";
import TrendingPage from "./pages/TrendingPage";
import CategoriesPage from "./pages/CategoriesPage";
import GenrePage from "./pages/GenrePage";
import ErrorBoundary from "./components/ErrorCatch/ErrorBoundary";

import { DetailMovieData } from "./context/movieContext";

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
