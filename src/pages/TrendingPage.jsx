import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import MovieSection from "../components/MovieSection/MovieSection";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { useNavigate } from "react-router";

export default function TrendingPage() {
  const { setSelectedMovie, apiKey, baseUrl, IMAGE_PATH } =
    useContext(MoviesContext);
  const navigate = useNavigate();

  const handleMovieDetail = (movie) => {
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  return (
    <>
      <Header />
      <div style={{ paddingTop: "80px" }}>
        <MovieSection
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          title='Trending Today'
          url='/trending/all/day'
          detail={handleMovieDetail}
        />
        <MovieSection
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          title='Trending This Week'
          url='/trending/all/week'
          detail={handleMovieDetail}
        />
      </div>
      <Footer />
    </>
  );
}
