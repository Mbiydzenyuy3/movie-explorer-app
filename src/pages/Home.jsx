import HeroSection from "../components/HeroSection/HeroCard";
import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import { MoviesContext } from "../context/movieContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useFetchMovies from "../hook/useMoviesFetch";
import HybridFeed from "../components/HybridFeed/HybridFeed";
import { useMood } from "../context/MoodContext";
import VibeSelector from "../components/VibeSelector/VibeSelector";
import MoodSelector from "../components/MoodSelector/MoodSelector";
import MovieCarousel from "../components/MovieCarousel/MovieCarousel";
// import Shorts from "../components/Shorts/Shorts";

export default function Homepage() {
  const { setSelectedMovie, apiKey, baseUrl, IMAGE_PATH } =
    useContext(MoviesContext);
  const navigate = useNavigate();
  const { currentMood, isMoodActive } = useMood();

  // Fetch popular movies
  const popularUrl = `${baseUrl}/movie/popular?api_key=${apiKey}`;
  const { movies: popularMovies } = useFetchMovies(popularUrl);

  // Fetch popular TV series for Shorts section
  const [tvSeries, setTvSeries] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(true);

  useEffect(() => {
    const fetchTvSeries = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/tv/popular?api_key=${apiKey}&page=1`
        );
        const data = await response.json();
        // Filter to get series with fewer episodes (short dramas)
        const shortSeries = data.results?.slice(0, 12) || [];
        setTvSeries(shortSeries);
      } catch (error) {
        console.error("Error fetching TV series:", error);
      } finally {
        setLoadingSeries(false);
      }
    };

    if (apiKey && baseUrl) {
      fetchTvSeries();
    }
  }, [apiKey, baseUrl]);

  const handleMovieDetail = (movie) => {
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  return (
    <>
      <Header />

      {/* VibeSelector - Chatbot-like mode selector */}
      <VibeSelector />

      {/* MoodSelector - Advanced mood-based movie finder */}
      <MoodSelector />

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

      {/* Short Dramas Section - DramaBox/ReelShorts Style */}
      {/* {!loadingSeries && tvSeries.length > 0 && (
        <Shorts
          title='Short Dramas'
          seriesList={tvSeries}
          IMAGE_PATH={IMAGE_PATH}
          apiKey={apiKey}
          baseUrl={baseUrl}
        />
      )} */}

      {/* Movie Sections with Carousel */}
      <MovieCarousel
        title='Trending Now'
        movies={popularMovies || []}
        IMAGE_PATH={IMAGE_PATH}
        onMovieClick={handleMovieDetail}
      />

      <MovieCarousel
        title='Action & Adventure'
        movies={popularMovies?.slice(0, 10) || []}
        IMAGE_PATH={IMAGE_PATH}
        onMovieClick={handleMovieDetail}
      />

      <MovieCarousel
        title='Romance & Drama'
        movies={popularMovies?.slice(5, 15) || []}
        IMAGE_PATH={IMAGE_PATH}
        onMovieClick={handleMovieDetail}
      />

      <MovieCarousel
        title='Comedy'
        movies={popularMovies?.slice(10, 20) || []}
        IMAGE_PATH={IMAGE_PATH}
        onMovieClick={handleMovieDetail}
      />

      <Footer />
    </>
  );
}
