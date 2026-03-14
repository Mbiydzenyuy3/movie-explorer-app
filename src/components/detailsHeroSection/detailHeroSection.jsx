import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Play, Plus, Check, X, ChevronDown } from "lucide-react";
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
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

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
    // Open embedded player for trailer
    if (trailerKey) {
      setIsPlayingTrailer(true);
      setShowPlayer(true);
    }
  };

  // Get embedded streaming URL for full movie
  const getEmbedUrl = () => {
    if (!movie?.id) return null;
    const mediaType = movie?.media_type || "movie";
    return `https://vidsrc.to/embed/${mediaType}/${movie.id}`;
  };

  // Get YouTube embed URL for trailer
  const getTrailerEmbedUrl = () => {
    if (!trailerKey) return null;
    return `https://www.youtube.com/embed/${trailerKey}?autoplay=1`;
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setIsPlayingTrailer(false);
  };

  const handleWatchFullMovie = () => {
    // Open embedded player directly on the page
    setShowPlayer(true);
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

  return (
    <>
      {/* Video Player Modal - Embedded Streaming */}
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
            <div className={styles.embedContainer}>
              <iframe
                src={isPlayingTrailer ? getTrailerEmbedUrl() : getEmbedUrl()}
                title={isPlayingTrailer ? "Trailer" : "Movie"}
                frameBorder='0'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
                className={styles.videoIframe}
              ></iframe>
            </div>
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
              {/* Watch Full Movie Button */}
              <button className={styles.playBtn} onClick={handleWatchFullMovie}>
                <Play size={24} fill='currentColor' />
                <span>Watch Now</span>
              </button>

              {/* Watch Trailer Button */}
              <button
                className={styles.trailerBtn}
                onClick={handlePlayTrailer}
                disabled={!trailerKey}
              >
                <Play size={20} fill='currentColor' />
                <span>Trailer</span>
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
