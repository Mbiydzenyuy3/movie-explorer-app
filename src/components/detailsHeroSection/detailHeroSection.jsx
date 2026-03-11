import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Play, Plus, Check, X, ChevronDown } from "lucide-react";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import styles from "../detailsHeroSection/detailsHeroSection.module.css";

export default function DetailsHeroSection({
  title,
  backgroundImage,
  description,
  movie,
  apiKey,
  baseUrl
}) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Fetch trailer
  useEffect(() => {
    const fetchTrailer = async () => {
      if (!movie?.id || !apiKey || !baseUrl) return;

      try {
        const response = await fetch(
          `${baseUrl}/movie/${movie.id}/videos?api_key=${apiKey}`
        );
        const data = await response.json();

        // Find YouTube trailer
        const trailer = data.results?.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );

        if (trailer) {
          setTrailerKey(trailer.key);
        }
      } catch (error) {
        console.error("Error fetching trailer:", error);
      }
    };

    fetchTrailer();
  }, [movie?.id, apiKey, baseUrl]);

  // Check watchlist status
  useEffect(() => {
    if (movie?.id) {
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      setIsInWatchlist(watchlist.some((item) => item.id === movie.id));
    }
  }, [movie?.id]);

  const handlePlayTrailer = () => {
    if (trailerKey) {
      setShowPlayer(true);
    }
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
  };

  const handleWatchlist = () => {
    if (!movie) return;

    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");

    if (isInWatchlist) {
      // Remove from watchlist
      const updated = watchlist.filter((item) => item.id !== movie.id);
      localStorage.setItem("watchlist", JSON.stringify(updated));
      setIsInWatchlist(false);
    } else {
      // Add to watchlist
      watchlist.push(movie);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      setIsInWatchlist(true);
    }
  };

  // For demo: create a sample HLS stream (in production, this would come from your video backend)
  const demoStreamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  return (
    <>
      {/* Video Player Modal */}
      {showPlayer && (
        <div className={styles.videoModal}>
          <div className={styles.videoModalContent}>
            <button
              className={styles.closePlayer}
              onClick={handleClosePlayer}
              aria-label='Close player'
            >
              <X size={24} />
            </button>
            <VideoPlayer
              src={demoStreamUrl}
              title={`${title} - Trailer`}
              poster={`https://image.tmdb.org/t/p/original${backgroundImage}`}
              onEnded={handleClosePlayer}
              autoPlay={true}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div
        className={styles.detailheroSection}
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 100%),
                           url(https://image.tmdb.org/t/p/original${backgroundImage})`
        }}
      >
        <div className={styles.movieDetail}>
          {/* Title */}
          <h1 className={styles.movieTitle}>{title}</h1>

          {/* Meta Info */}
          <div className={styles.detailInitial}>
            <span className={styles.rating}>PG-13</span>
            <div className={styles.production}>
              {movie?.genres?.slice(0, 3).map((genre, index) => (
                <span key={genre.id}>
                  {genre.name}
                  {index < Math.min(movie.genres.length, 3) - 1 && (
                    <span> • </span>
                  )}
                </span>
              ))}
            </div>
            {movie?.runtime && (
              <span className={styles.runtime}>
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.heroBtns}>
            <div className={styles.heroBtn}>
              {/* Play Trailer Button */}
              <button
                className={styles.playBtn}
                onClick={handlePlayTrailer}
                disabled={!trailerKey}
              >
                <Play size={24} fill='currentColor' />
                <span>Watch Trailer</span>
              </button>

              {/* Watchlist Button */}
              <button
                className={`${styles.watchlistBtn} ${isInWatchlist ? styles.active : ""}`}
                onClick={handleWatchlist}
                aria-label={
                  isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
                }
              >
                {isInWatchlist ? <Check size={20} /> : <Plus size={20} />}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className={styles.descriptionWrapper}>
            <p
              className={`${styles.movieDescription} ${showFullDesc ? styles.expanded : ""}`}
            >
              {description}
            </p>
            {description?.length > 200 && (
              <button
                className={styles.showMoreBtn}
                onClick={() => setShowFullDesc(!showFullDesc)}
              >
                {showFullDesc ? "Show less" : "Read more"}
                <ChevronDown
                  size={16}
                  className={showFullDesc ? styles.rotated : ""}
                />
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className={styles.additionalInfo}>
            {movie?.vote_average && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Rating</span>
                <span className={styles.infoValue}>
                  ★ {movie.vote_average.toFixed(1)}/10
                </span>
              </div>
            )}
            {movie?.release_date && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Release</span>
                <span className={styles.infoValue}>
                  {new Date(movie.release_date).getFullYear()}
                </span>
              </div>
            )}
            {movie?.original_language && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Language</span>
                <span className={styles.infoValue}>
                  {movie.original_language.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

DetailsHeroSection.propTypes = {
  backgroundImage: PropTypes.string,
  description: PropTypes.string,
  title: PropTypes.string,
  movie: PropTypes.object,
  storage: PropTypes.func,
  apiKey: PropTypes.string,
  baseUrl: PropTypes.string
};
