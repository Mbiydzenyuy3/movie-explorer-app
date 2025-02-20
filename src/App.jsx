import { BrowserRouter, Routes, Route } from "react-router";
import Homepage from "./pages/Home";
import DetailPage from "./pages/MovieDetailsPage";

import { DetailMovieData } from "./context/movieContext";

function App() {
  return (
    <DetailMovieData>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/details/:id" element={<DetailPage />} />
        </Routes>
      </BrowserRouter>
    </DetailMovieData>
  );
}

export default App;
