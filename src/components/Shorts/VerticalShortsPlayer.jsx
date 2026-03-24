import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  List,
  ChevronUp,
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,
  SkipForward,
  SkipBack,
  Loader2
} from "lucide-react";
import styles from "./VerticalShortsPlayer.module.css";

/**
 * Vertical Shorts Player - DramaBox/ReelShorts Style
 *
 * Features:
 * - Full-screen vertical video player
 * - Swipe up/down to navigate episodes
 * - Episode selector overlay
 * - Auto-play next episode
 * - TikTok-like interaction buttons
 */
export default function VerticalShortsPlayer({
  series,
  episodes = [],
  currentEpisodeIndex = 0,
  onClose,
  onEpisodeChange,
  getVideoUrl,
  IMAGE_PATH
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(currentEpisodeIndex);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const currentEpisode = episodes[currentIndex];

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (isPlaying) {
        video.play().catch(() => {});
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      // Auto-play next episode
      if (currentIndex < episodes.length - 1) {
        handleNextEpisode();
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [currentIndex, episodes.length]);

  // Update video source when episode changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentEpisode) {
      const videoUrl = getVideoUrl ? getVideoUrl(currentEpisode) : null;
      if (videoUrl) {
        video.src = videoUrl;
        video.load();
        setIsLoading(true);
        setCurrentTime(0);
        if (isPlaying) {
          video.play().catch(() => {});
        }
      }
    }
  }, [currentEpisode, getVideoUrl]);

  // Apply volume to video element
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowUp":
          e.preventDefault();
          handlePrevEpisode();
          break;
        case "ArrowDown":
          e.preventDefault();
          handleNextEpisode();
          break;
        case "m":
          toggleMute();
          break;
        case "Escape":
          if (showEpisodeList) {
            setShowEpisodeList(false);
          } else {
            onClose?.();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showEpisodeList]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
    setShowControls(true);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleNextEpisode = useCallback(() => {
    if (currentIndex < episodes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onEpisodeChange?.(currentIndex + 1);
    }
  }, [currentIndex, episodes.length, onEpisodeChange]);

  const handlePrevEpisode = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onEpisodeChange?.(currentIndex - 1);
    }
  }, [currentIndex, onEpisodeChange]);

  // Touch swipe handling
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe up - next episode
        handleNextEpisode();
      } else {
        // Swipe down - previous episode
        handlePrevEpisode();
      }
    }

    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  const handleEpisodeSelect = (index) => {
    setCurrentIndex(index);
    setShowEpisodeList(false);
    onEpisodeChange?.(index);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (!currentEpisode) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>No episodes available</p>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowControls(!showControls);
        }
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={styles.video}
        playsInline
        loop={false}
        muted={isMuted}
        poster={currentEpisode.poster || `${IMAGE_PATH}${series?.poster_path}`}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <Loader2 className={styles.spinner} size={40} />
        </div>
      )}

      {/* Top Bar */}
      <div className={`${styles.topBar} ${showControls ? styles.visible : ""}`}>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={28} />
        </button>
        <div className={styles.seriesInfo}>
          <h3 className={styles.seriesTitle}>
            {series?.name || "Short Drama"}
          </h3>
          <p className={styles.episodeInfo}>
            Episode {currentIndex + 1} of {episodes.length}
          </p>
        </div>
        <button
          onClick={() => setShowEpisodeList(!showEpisodeList)}
          className={styles.listBtn}
        >
          <List size={24} />
        </button>
      </div>

      {/* Episode List Overlay */}
      {showEpisodeList && (
        <div className={styles.episodeOverlay}>
          <div className={styles.episodeHeader}>
            <h4>Episodes</h4>
            <button onClick={() => setShowEpisodeList(false)}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.episodeList}>
            {episodes.map((ep, index) => (
              <button
                key={ep.id || index}
                className={`${styles.episodeItem} ${
                  index === currentIndex ? styles.active : ""
                }`}
                onClick={() => handleEpisodeSelect(index)}
              >
                <span className={styles.epNumber}>Ep {index + 1}</span>
                <span className={styles.epTitle}>
                  {ep.name || `Episode ${index + 1}`}
                </span>
                {index === currentIndex && (
                  <span className={styles.playingIcon}>
                    <Play size={14} fill='white' />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Side Actions */}
      <div
        className={`${styles.actions} ${showControls ? styles.visible : ""}`}
      >
        <button
          className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart size={28} fill={isLiked ? "#ff4757" : "none"} />
          <span className={styles.actionCount}>1.2K</span>
        </button>
        <button className={styles.actionBtn}>
          <MessageCircle size={28} />
          <span className={styles.actionCount}>328</span>
        </button>
        <button className={styles.actionBtn}>
          <Share2 size={28} />
          <span className={styles.actionCount}>Share</span>
        </button>
      </div>

      {/* Bottom Controls */}
      <div
        className={`${styles.bottomControls} ${showControls ? styles.visible : ""}`}
      >
        {/* Episode Navigation */}
        <div className={styles.episodeNav}>
          <button
            onClick={handlePrevEpisode}
            disabled={currentIndex === 0}
            className={styles.navBtn}
          >
            <SkipBack size={20} />
            <span>Prev</span>
          </button>
          <button
            onClick={handleNextEpisode}
            disabled={currentIndex === episodes.length - 1}
            className={styles.navBtn}
          >
            <span>Next</span>
            <SkipForward size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer} onClick={handleSeek}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.timeDisplay}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Play/Pause & Volume */}
        <div className={styles.playbackControls}>
          <button onClick={togglePlay} className={styles.playBtn}>
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button onClick={toggleMute} className={styles.volumeBtn}>
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <input
            type='range'
            min='0'
            max='1'
            step='0.1'
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            aria-label='Volume'
          />
        </div>

        {/* Swipe Hint */}
        <div className={styles.swipeHint}>
          <ChevronUp size={20} />
          <span>Swipe for next</span>
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );
}

VerticalShortsPlayer.propTypes = {
  series: PropTypes.object,
  episodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      poster: PropTypes.string,
      videoUrl: PropTypes.string
    })
  ).isRequired,
  currentEpisodeIndex: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onEpisodeChange: PropTypes.func,
  getVideoUrl: PropTypes.func,
  IMAGE_PATH: PropTypes.string
};

VerticalShortsPlayer.defaultProps = {
  series: {},
  episodes: [],
  currentEpisodeIndex: 0,
  onEpisodeChange: () => {},
  getVideoUrl: null,
  IMAGE_PATH: "https://image.tmdb.org/t/p/w500"
};
