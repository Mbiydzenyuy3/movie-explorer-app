import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { Play, Plus, Check, X, Search, Loader2, Film } from "lucide-react";
import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import VibeSelector from "../components/VibeSelector/VibeSelector";
import styles from "./SearchPage.module.css";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query") || "";
  const vibe = searchParams.get("vibe") || "";

  const { apiKey, baseUrl, IMAGE_PATH, setSelectedMovie } =
    useContext(MoviesContext);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
    setWatchlist(saved);
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query && !vibe) {
        setMovies([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = "";

        if (vibe) {
          // Search by vibe/mood - map to genres
          const vibeGenreMap = {
            energetic: 28, // Action
            relaxed: 35, // Comedy
            tense: 53, // Thriller
            adventurous: 12, // Adventure
            nostalgic: 36, // History
            curious: 99, // Documentary
            romantic: 10749, // Romance
            dark: 27 // Horror
          };
          const genreId = vibeGenreMap[vibe] || 28;
          url = `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc`;
        } else {
          // Regular text search
          url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        setMovies(data.results || []);
      } catch (err) {
        setError("Failed to fetch search results");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, vibe, apiKey, baseUrl]);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  const toggleWatchlist = (movie, e) => {
    e.stopPropagation();
    const current = JSON.parse(localStorage.getItem("watchlist") || "[]");
    const isInList = current.some((m) => m.id === movie.id);

    if (isInList) {
      const filtered = current.filter((m) => m.id !== movie.id);
      localStorage.setItem("watchlist", JSON.stringify(filtered));
      setWatchlist(filtered);
    } else {
      const updated = [...current, movie];
      localStorage.setItem("watchlist", JSON.stringify(updated));
      setWatchlist(updated);
    }
  };

  const isInWatchlist = (movieId) => watchlist.some((m) => m.id === movieId);

  const getTitle = () => {
    if (vibe) {
      const vibeNames = {
        energetic: "Energetic",
        relaxed: "Relaxed",
        tense: "Tense",
        adventurous: "Adventurous",
        nostalgic: "Nostalgic",
        curious: "Curious",
        romantic: "Romantic",
        dark: "Dark"
      };
      return `${vibeNames[vibe] || vibe} Movies`;
    }
    return `Search Results for "${query}"`;
  };

  return (
    <>
      <Header />
      <VibeSelector />

      <main className={styles.searchPage}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>{getTitle()}</h1>
            <p className={styles.count}>
              {loading ? "Loading..." : `${movies.length} movies found`}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loading} aria-live="polite" aria-busy="true">
              <Loader2 className={styles.spinner} size={40} />
              <p>Searching movies...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              <X size={40} />
              <p>{error}</p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && movies.length > 0 && (
            <div
              className={styles.moviesGrid}
              role='list'
              aria-label='Search results'
            >
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className={styles.movieCard}
                  onClick={() => handleMovieClick(movie)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleMovieClick(movie);
                    }
                  }}
                  role='listitem'
                  tabIndex={0}
                  aria-label={`${movie.title}, ${movie.release_date?.split("-")[0] || "N/A"}, rated ${movie.vote_average?.toFixed(1) || "N/A"} stars`}
                >
                  {/* Poster */}
                  <div className={styles.posterWrapper}>
                    {movie.poster_path ? (
                      <img
                        src={`${IMAGE_PATH}${movie.poster_path}`}
                        alt={movie.title}
                        className={styles.poster}
                      />
                    ) : (
                      <div className={styles.noPoster}>
                        <Film size={40} />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className={styles.overlay}>
                      <button
                        className={styles.playBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovieClick(movie);
                        }}
                      >
                        <Play size={24} fill='currentColor' />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={styles.info}>
                    <h3 className={styles.movieTitle}>{movie.title}</h3>
                    <div className={styles.meta}>
                      <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
                      <span>•</span>
                      <span>★ {movie.vote_average?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actions}>
                    <button
                      className={styles.watchBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovieClick(movie);
                      }}
                    >
                      <Play size={16} />
                      <span>Watch</span>
                    </button>
                    <button
                      className={`${styles.favoriteBtn} ${isInWatchlist(movie.id) ? styles.active : ""}`}
                      onClick={(e) => toggleWatchlist(movie, e)}
                    >
                      {isInWatchlist(movie.id) ? (
                        <Check size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && movies.length === 0 && (
            <div className={styles.empty}>
              <Search size={60} />
              <h2>No movies found</h2>
              <p>Try searching for something else or browse by genre</p>
              <button
                className={styles.browseBtn}
                onClick={() => navigate("/movies")}
              >
                Browse Movies
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
