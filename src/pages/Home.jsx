import LatestMovies from "../components/LatestMovies/LatestMovies";
import MoviesLayout from "../components/MoviesLayout/MoviesLayout";
import TopSearches from "../components/TopSearches/TopSearches";
import HeroSection from "../components/HeroSection/HeroCard";
import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { useNavigate } from "react-router";
import useFetchMovies from "../hook/useMoviesFetch";
import HybridFeed from "../components/HybridFeed/HybridFeed";
import { useMood } from "../context/MoodContext";
import VibeSelector from "../components/VibeSelector/VibeSelector";

export default function Homepage() {
  const { setSelectedMovie, apiKey, baseUrl, IMAGE_PATH } =
    useContext(MoviesContext);
  const navigate = useNavigate();
  const { currentMood, isMoodActive } = useMood();

  const popularUrl = `${baseUrl}/movie/popular?api_key=${apiKey}`;
  const { movies: popularMovies } = useFetchMovies(popularUrl);

  const handleMovieDetail = (movie) => {
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  return (
    <>
      <Header />

      {/* VibeSelector - Chatbot-like mode selector */}
      <VibeSelector />

      {/* Hybrid Feed - Mixed Content based on mood */}
      {isMoodActive && currentMood && (
        <HybridFeed
          mood={currentMood}
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          onMovieClick={handleMovieDetail}
        />
      )}

      {/* Default Hero Section when no mood selected */}
      {!isMoodActive && popularMovies && popularMovies.length > 0 && (
        <HeroSection
          movies={popularMovies}
          storage={handleMovieDetail}
          IMAGE_PATH={IMAGE_PATH}
        />
      )}

      {/* Movie Sections */}
      <LatestMovies
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        genre={80}
        detail={handleMovieDetail}
      />

      <TopSearches
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        path='popular'
        genre={27}
        detail={handleMovieDetail}
      />

      <MoviesLayout
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        title='Action'
        genre={53}
        detail={handleMovieDetail}
      />

      <MoviesLayout
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        title='Romance & Drama'
        genre={10749}
        detail={handleMovieDetail}
      />

      <MoviesLayout
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        title='Comedy'
        genre={37}
        detail={handleMovieDetail}
      />

      <Footer />
    </>
  );
}
