import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { Play, Bookmark, Film, Trash2 } from "lucide-react";
import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import VibeSelector from "../components/VibeSelector/VibeSelector";
import styles from "./SearchPage.module.css";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { IMAGE_PATH, setSelectedMovie } = useContext(MoviesContext);

  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
    setWatchlist(saved);
  }, []);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  const removeFromWatchlist = (movieId) => {
    const updated = watchlist.filter((m) => m.id !== movieId);
    localStorage.setItem("watchlist", JSON.stringify(updated));
    setWatchlist(updated);
  };

  const clearAll = () => {
    if (window.confirm("Remove all movies from your watchlist?")) {
      localStorage.removeItem("watchlist");
      setWatchlist([]);
    }
  };

  return (
    <>
      <Header />
      <VibeSelector />

      <main className={styles.searchPage}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div>
                <h1 className={styles.title}>
                  <Bookmark
                    size={28}
                    style={{ marginRight: "12px", color: "#e50914" }}
                  />
                  My Watchlist
                </h1>
                <p className={styles.count}>
                  {watchlist.length}{" "}
                  {watchlist.length === 1 ? "movie" : "movies"} saved
                </p>
              </div>
              {watchlist.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Movies Grid */}
          {watchlist.length > 0 ? (
            <div className={styles.moviesGrid}>
              {watchlist.map((movie) => (
                <div
                  key={movie.id}
                  className={styles.movieCard}
                  onClick={() => handleMovieClick(movie)}
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

                    {/* Overlay */}
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

                  {/* Actions */}
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
                      className={`${styles.favoriteBtn} ${styles.active}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(movie.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className={styles.empty}>
              <Bookmark size={60} />
              <h2>Your watchlist is empty</h2>
              <p>Save movies to watch later by clicking the + button</p>
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
