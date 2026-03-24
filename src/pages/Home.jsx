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
import AdBanner from "../components/Monetization/AdBanner";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import WatchHistoryService from "../services/WatchHistoryService";
// import Shorts from "../components/Shorts/Shorts";


export default function Homepage() {
  const { setSelectedMovie, apiKey, baseUrl, IMAGE_PATH } =
    useContext(MoviesContext);
  const navigate = useNavigate();
  const { currentMood, isMoodActive } = useMood();
  const { user, getToken, isPro } = useAuth();
  
  const [watchHistory, setWatchHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch popular movies
  const popularUrl = `${baseUrl}/movie/popular?api_key=${apiKey}`;
  const { movies: popularMovies } = useFetchMovies(popularUrl);

  // Fetch watch history for intelligent dashboard
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoadingHistory(true);
      try {
        const token = await getToken();
        const history = await WatchHistoryService.getRecentHistory(token, user.id);
        setWatchHistory(history);
      } catch (err) {
        console.error("Error fetching watch history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user, getToken]);

  const handleMovieDetail = (movie) => {
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
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

      {/* Ad Banner for Free Tier Users */}
      {!isPro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 8px" }}
        >
          <AdBanner isPro={isPro} />
        </motion.div>
      )}

      {/* Intelligent Dashboard: Continue Watching */}
      <AnimatePresence>
        {watchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <MovieCarousel
              title='Continue Watching'
              movies={watchHistory.map(h => ({
                id: h.movie_id,
                title: h.title,
                poster_path: h.poster_path,
                backdrop_path: h.backdrop_path,
                progress: (h.progress_seconds / h.duration_seconds) * 100
              }))}
              IMAGE_PATH={IMAGE_PATH}
              onMovieClick={handleMovieDetail}
              showProgress={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  );
}

