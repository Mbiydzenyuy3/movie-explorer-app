import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";
import styles from "./HLSPlayer.module.css";

/**
 * Native HLS Player - Plays M3U8 streams directly
 * 
 * Features:
 * - Direct M3U8 playback (no iframe, no ads)
 * - HLS.js for adaptive bitrate streaming
 * - Custom controls
 * - Fullscreen support
 */
export default function HLSPlayer({
  src,
  poster,
  title,
  onClose,
  onEnded
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const controlsTimeoutRef = useRef(null);

  // Initialize HLS.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset state
    setIsLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        // Auto quality switching
        autoStartLoad: true
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error - trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error - trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              setError("Failed to load video");
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } 
    // For Safari and other native HLS support
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });
    } else {
      setError("HLS not supported in this browser");
    }
  }, [src]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => onEnded?.();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [onEnded]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "ArrowLeft":
          seek(-10);
          break;
        case "ArrowRight":
          seek(10);
          break;
        case "Escape":
          onClose?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const seek = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={styles.container} 
      ref={containerRef}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={styles.video}
        playsInline
        poster={poster}
        onClick={togglePlay}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <Loader2 className={styles.spinner} size={48} />
          <span>Loading stream...</span>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className={styles.errorOverlay}>
          <AlertCircle size={48} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className={`${styles.topBar} ${showControls ? styles.visible : ""}`}>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={28} />
        </button>
        <h3 className={styles.title}>{title}</h3>
      </div>

      {/* Center Play Button */}
      {!isPlaying && !isLoading && (
        <button className={styles.centerPlayBtn} onClick={togglePlay}>
          <Play size={64} fill="white" />
        </button>
      )}

      {/* Bottom Controls */}
      <div className={`${styles.bottomControls} ${showControls ? styles.visible : ""}`}>
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

        {/* Control Buttons */}
        <div className={styles.controls}>
          <button onClick={togglePlay} className={styles.controlBtn}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button onClick={() => seek(-10)} className={styles.controlBtn}>
            -10s
          </button>
          
          <button onClick={() => seek(10)} className={styles.controlBtn}>
            +10s
          </button>
          
          <button onClick={toggleMute} className={styles.controlBtn}>
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          
          <div className={styles.volumeSlider}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (videoRef.current) {
                  videoRef.current.volume = val;
                }
                setVolume(val);
                setIsMuted(val === 0);
              }}
            />
          </div>
          
          <button onClick={toggleFullscreen} className={styles.controlBtn}>
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}

HLSPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func,
  onEnded: PropTypes.func
};

HLSPlayer.defaultProps = {
  poster: "",
  title: "Video Player",
  onClose: () => {},
  onEnded: () => {}
};
