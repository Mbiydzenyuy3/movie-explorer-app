import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import MovieSection from "../components/MovieSection/MovieSection";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { useNavigate } from "react-router";

export default function MoviesPage() {
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
          title='Popular Movies'
          url='/movie/popular'
          detail={handleMovieDetail}
        />
        <MovieSection
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          title='Top Rated Movies'
          url='/movie/top_rated'
          detail={handleMovieDetail}
        />
        <MovieSection
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          title='Upcoming Movies'
          url='/movie/upcoming'
          detail={handleMovieDetail}
        />
        <MovieSection
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          title='Now Playing Movies'
          url='/movie/now_playing'
          detail={handleMovieDetail}
        />
      </div>
      <Footer />
    </>
  );
}
