import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import MovieSection from "../components/MovieSection/MovieSection";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { useNavigate } from "react-router";

export default function SeriesPage() {
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
          title='Popular TV Series'
          url='/tv/popular'
          detail={handleMovieDetail}
        />
        <MovieSection
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          title='Top Rated TV Series'
          url='/tv/top_rated'
          detail={handleMovieDetail}
        />
        <MovieSection
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          title='On The Air TV Series'
          url='/tv/on_the_air'
          detail={handleMovieDetail}
        />
        <MovieSection
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          title='Airing Today TV Series'
          url='/tv/airing_today'
          detail={handleMovieDetail}
        />
      </div>
      <Footer />
    </>
  );
}
