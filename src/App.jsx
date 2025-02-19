import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorCatch/ErrorBoundary";
import { DetailMovieData } from "./context/movieContext";
import HomePage from "./pages/Home";
import MovieDetailsPage from "./pages/MovieDetailsPage";

function App() {
  return (
    <DetailMovieData>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </DetailMovieData>
  );
}

export default App;
