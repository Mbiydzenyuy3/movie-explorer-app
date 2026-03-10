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
import MoodSelector from "../components/MoodSelector/MoodSelector";
import VibeSearch from "../components/VibeSearch/VibeSearch";
import HybridFeed from "../components/HybridFeed/HybridFeed";
import { useMood } from "../context/MoodContext";

export default function Homepage() {
  const { setSelectedMovie, apiKey, baseUrl, IMAGE_PATH } =
    useContext(MoviesContext);
  const navigate = useNavigate();
  const { currentMood, isMoodActive } = useMood();

  console.log(apiKey);

  const popularUrl = `${baseUrl}/movie/popular?api_key=${apiKey}`;
  const { movies: popularMovies } = useFetchMovies(popularUrl);

  const handleMovieDetail = (movie) => {
    console.log(movie);
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  return (
    <>
      <Header />

      {/* Vibe Search - Natural Language Search */}
      <VibeSearch />

      {/*  Mood-Based Discovery */}
      <MoodSelector />

      {/*  Hybrid Feed - Mixed Content */}
      {isMoodActive && currentMood && (
        <HybridFeed
          mood={currentMood}
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          onMovieClick={handleMovieDetail}
        />
      )}

      {!isMoodActive && popularMovies && popularMovies.length > 0 && (
        <HeroSection
          movies={popularMovies}
          storage={handleMovieDetail}
          IMAGE_PATH={IMAGE_PATH}
        />
      )}
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
