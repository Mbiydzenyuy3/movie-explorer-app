import LatestMovies from "../components/LatestMovies/LatestMovies";
import MoviesLayout from "../components/MoviesLayout/MoviesLayout";
import TopSearches from "../components/TopSearches/TopSearches";
import HeroSection from "../components/HeroSection/HeroCard";
import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { useNavigate } from "react-router";

export default function Homepage() {
  const { setSelectedMovie, apiKey, baseUrl, IMAGE_PATH } =
    useContext(MoviesContext);
  const navigate = useNavigate();

  console.log(apiKey);

  const handleMovieDetail = (movie) => {
    console.log(movie);
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  return (
    <>
      <Header />
      <HeroSection />
      <LatestMovies
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        detail={handleMovieDetail}
      />

      <TopSearches
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        path="popular"
        detail={handleMovieDetail}
      />
      <MoviesLayout
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        title="Action"
        genre={53}
        detail={handleMovieDetail}
      />
      <MoviesLayout
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        title="Romance & Drama"
        genre={10749}
        detail={handleMovieDetail}
      />
      <MoviesLayout
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        title="Comedy"
        genre={37}
        detail={handleMovieDetail}
      />

      <Footer />
    </>
  );
}
