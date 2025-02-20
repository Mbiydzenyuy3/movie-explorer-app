import { BrowserRouter, Routes, Route } from "react-router";
import Homepage from "./pages/Home";
import DetailPage from "./pages/MovieDetailsPage";
import ErrorBoundary from "./components/ErrorCatch/ErrorBoundary";

import { DetailMovieData } from "./context/movieContext";

function App() {
  return (
    <ErrorBoundary>
      <DetailMovieData>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/details/:id" element={<DetailPage />} />
          </Routes>
        </BrowserRouter>
      </DetailMovieData>
    </ErrorBoundary>
  );
}

export default App;
