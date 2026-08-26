import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Play, Plus, Check, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../detailsHeroSection/detailsHeroSection.module.css";
import WatchProviders from "../WatchProviders/WatchProviders";

export default function DetailsHeroSection({
  title,
  backgroundImage,
  description,
  movie,
  baseUrl
}) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  // Fetch trailer
  useEffect(() => {
    const fetchTrailer = async () => {
      if (!movie?.id || !baseUrl) return;

      try {
        const response = await fetch(
          `${baseUrl}/movie/${movie.id}/videos`
        );
        const data = await response.json();

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
  }, [movie?.id, baseUrl]);

  // Check watchlist
  useEffect(() => {
    if (movie?.id) {
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      setIsInWatchlist(watchlist.some((item) => item.id === movie.id));
    }
  }, [movie?.id]);

  // Handle Watch Trailer
  const handlePlayTrailer = () => {
    setIsPlayingTrailer(true);
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setIsPlayingTrailer(false);
  };

  const handleWatchlist = () => {
    if (!movie) return;

    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");

    if (isInWatchlist) {
      const updated = watchlist.filter((item) => item.id !== movie.id);
      localStorage.setItem("watchlist", JSON.stringify(updated));
      setIsInWatchlist(false);
    } else {
      watchlist.push(movie);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      setIsInWatchlist(true);
    }
  };

  // Get YouTube nocookie embed URL for trailer (no ads, no tracking)
  const getTrailerEmbedUrl = () => {
    if (!trailerKey) return null;
    return `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`;
  };

  return (
    <>
      {/* Video Player Modal */}
      <AnimatePresence>
        {showPlayer && (
          <motion.div
            className={styles.videoModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className={styles.videoModalContent}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                className={styles.closePlayer}
                onClick={handleClosePlayer}
                aria-label="Close player"
              >
                <X size={24} />
              </button>

              {/* Trailer Player — YouTube nocookie (no tracking/ad targeting) */}
              {isPlayingTrailer && (
                <div className={styles.embedContainer}>
                  <iframe
                    src={getTrailerEmbedUrl()}
                    title={`${title}: Official Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.videoIframe}
                  />
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              {/* Trailer is the only thing we can play ourselves; everything
                  else routes out to a licensed provider via WatchProviders. */}
              <button
                className={styles.playBtn}
                onClick={handlePlayTrailer}
                disabled={!trailerKey}
              >
                <Play size={24} fill='currentColor' />
                <span>{trailerKey ? "Play Trailer" : "No Trailer"}</span>
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

          {/* Where to watch — legitimate availability, replaces in-app playback */}
          {movie?.id && (
            <div className={styles.watchProvidersWrapper}>
              <WatchProviders
                tmdbId={movie.id}
                mediaType={movie.media_type === "tv" ? "tv" : "movie"}
                title={title}
              />
            </div>
          )}

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
  baseUrl: PropTypes.string
};
