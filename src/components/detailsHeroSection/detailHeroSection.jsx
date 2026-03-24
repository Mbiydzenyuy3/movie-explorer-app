import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Play, Plus, Check, X, ChevronDown, Loader2, ExternalLink, Tv, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../detailsHeroSection/detailsHeroSection.module.css";
import HLSPlayer from "../HLSPlayer/HLSPlayer";
import AffiliateLink from "../Monetization/AffiliateLink";
import { getMovieStream } from "../../services/streaming-service";
import { useAuth } from "../../context/AuthContext";
import WatchHistoryService from "../../services/WatchHistoryService";

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
  
  // Native streaming state
  const [streamUrl, setStreamUrl] = useState(null);
  const [loadingStream, setLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [useNativePlayer, setUseNativePlayer] = useState(false);
  
  // Watch Persistence State
  const { user, getToken } = useAuth();
  const [initialProgress, setInitialProgress] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const lastSavedTimeRef = useRef(0);
  const [isResuming, setIsResuming] = useState(false);

  // Fetch trailer
  useEffect(() => {
    const fetchTrailer = async () => {
      if (!movie?.id || !apiKey || !baseUrl) return;

      try {
        const response = await fetch(
          `${baseUrl}/movie/${movie.id}/videos?api_key=${apiKey}`
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
  }, [movie?.id, apiKey, baseUrl]);

  // Check watchlist and fetch initial progress
  useEffect(() => {
    if (movie?.id) {
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      setIsInWatchlist(watchlist.some((item) => item.id === movie.id));

      const fetchSavedProgress = async () => {
        if (!user) return;
        const token = await getToken();
        const history = await WatchHistoryService.getRecentHistory(token, user.id);
        const entry = history.find(h => h.movie_id === movie.id);
        if (entry) {
          setInitialProgress(entry.progress_seconds);
          setIsResuming(true);
        }
      };
      fetchSavedProgress();
    }
  }, [movie?.id, user, getToken]);

  // Fetch stream URL using Consumet API
  const fetchStreamUrl = useCallback(async () => {
    if (!movie?.id) return;
    
    setLoadingStream(true);
    setStreamError(null);
    
    try {
      const mediaType = movie?.media_type || "movie";
      const streamData = await getMovieStream(movie.id);
      
      if (streamData?.url) {
        setStreamUrl(streamData.url);
        setUseNativePlayer(true);
      } else {
        // Fallback to embed if Consumet fails
        setStreamError("Direct stream unavailable. Using fallback player.");
        setUseNativePlayer(false);
      }
    } catch (error) {
      console.error("Error fetching stream:", error);
      setStreamError("Failed to load stream");
      setUseNativePlayer(false);
    } finally {
      setLoadingStream(false);
    }
  }, [movie?.id, movie?.media_type]);

  // Handle Watch Full Movie - try native player first
  const handleWatchFullMovie = async () => {
    setIsPlayingTrailer(false);
    setShowPlayer(true);
    
    // Try native player with Consumet API
    await fetchStreamUrl();
  };

  // Handle Watch Trailer
  const handlePlayTrailer = () => {
    setUseNativePlayer(false);
    setStreamUrl(null);
    setIsPlayingTrailer(true);
    setShowPlayer(true);
  };

  const handleClosePlayer = async () => {
    // Save final progress before closing
    if (user && currentProgress > 0) {
      const token = await getToken();
      await WatchHistoryService.updateProgress(
        token, 
        user.id, 
        movie, 
        currentProgress, 
        totalDuration || 0
      );
    }
    
    setShowPlayer(false);
    setIsPlayingTrailer(false);
    setStreamUrl(null);
    setUseNativePlayer(false);
    setIsResuming(false);
  };

  const handleTimeUpdate = (time) => {
    setCurrentProgress(time);
    
    // Throttle updates to Supabase - every 10 seconds
    if (user && Math.abs(time - lastSavedTimeRef.current) > 10) {
      lastSavedTimeRef.current = time;
      saveProgress(time);
    }
  };

  const saveProgress = async (time) => {
    const token = await getToken();
    await WatchHistoryService.updateProgress(
      token,
      user.id,
      movie,
      time,
      totalDuration
    );
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

              {/* Loading State */}
              {loadingStream && (
                <div className={styles.loadingStream}>
                  <Loader2 className={styles.spinner} size={48} />
                  <span>Finding best stream...</span>
                  <p>This may take a few seconds</p>
                </div>
              )}

              {/* Native HLS Player — Ad-free on-platform experience */}
              {useNativePlayer && streamUrl && !loadingStream && (
                <HLSPlayer
                  src={streamUrl}
                  poster={`https://image.tmdb.org/t/p/original${backgroundImage}`}
                  title={title}
                  onClose={handleClosePlayer}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={setTotalDuration}
                  autoPlay={true}
                  startOffset={initialProgress}
                />
              )}

              {/* Trailer Player — YouTube nocookie (no tracking/ad targeting) */}
              {isPlayingTrailer && !loadingStream && (
                <div className={styles.embedContainer}>
                  <iframe
                    src={getTrailerEmbedUrl()}
                    title={`${title} — Official Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.videoIframe}
                  />
                </div>
              )}

              {/* Clean No-Stream Fallback — NO third-party ad iframes */}
              {!useNativePlayer && !isPlayingTrailer && !loadingStream && (
                <div className={styles.noStreamFallback}>
                  <div className={styles.noStreamIcon}>
                    <Tv size={48} />
                  </div>
                  <h3 className={styles.noStreamTitle}>Direct stream unavailable</h3>
                  <p className={styles.noStreamSubline}>
                    This title isn&apos;t available on VibeBox yet. Watch it ad-free on your streaming service:
                  </p>
                  <AffiliateLink
                    movieTitle={title}
                    className={styles.noStreamAffiliate}
                  />
                  {streamError && (
                    <p className={styles.streamErrorNote}>{streamError}</p>
                  )}
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
              {/* Watch Full Movie Button */}
              <button className={styles.playBtn} onClick={handleWatchFullMovie}>
                {isResuming ? <RotateCcw size={22} /> : <Play size={24} fill='currentColor' />}
                <span>{isResuming ? "Resume" : "Watch Now"}</span>
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
