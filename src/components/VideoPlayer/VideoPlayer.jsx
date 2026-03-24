import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  Loader2,
  AlertCircle
} from "lucide-react";
import styles from "./VideoPlayer.module.css";

/**
 * Custom Video Player with HLS Adaptive Bitrate Streaming
 *
 * Features:
 * - HLS.js integration for adaptive streaming
 * - Keyboard shortcuts (Space, M, F, Arrow keys)
 * - Quality selection
 * - Volume control with mute
 * - Fullscreen support
 * - Auto-quality switching based on bandwidth
 */
export default function VideoPlayer({
  src,
  poster,
  title,
  onEnded,
  onError,
  autoPlay = false,
  initialQuality = -1, // -1 = auto
  enableEncryption = false,
  encryptionKey,
  audioTracks = [],
  onAudioTrackChange
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);

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
  const [showSettings, setShowSettings] = useState(false);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(initialQuality);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeAudioTrack, setActiveAudioTrack] = useState(0);

  const controlsTimeoutRef = useRef(null);

  // Initialize HLS.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset state
    setIsLoading(true);
    setError(null);
    setAvailableQualities([]);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        // Auto quality switching settings
        autoStartLoad: true,
        defaultAudioCodec: "mp4a.40.2",
        defaultVideoCodec: "avc1.42E01E"
      });

      hlsRef.current = hls;

      // Handle HLS events
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        // Extract quality levels
        const qualities = data.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate,
          label: level.height
            ? `${level.height}p`
            : `${Math.round(level.bitrate / 1000)}k`
        }));
        setAvailableQualities([{ index: -1, label: "Auto" }, ...qualities]);

        if (autoPlay) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        if (currentQuality === -1) {
          // Auto mode - quality was switched automatically
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error. Trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error. Trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              setError("Playback error occurred");
              hls.destroy();
              onError?.(data);
              break;
          }
        }
      });

      // Load source
      hls.loadSource(src);

      // Attach to video element
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => {});
      }
      setIsLoading(false);
    } else {
      // No HLS support
      setError("Your browser does not support HLS streaming");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, onError, currentQuality]);

  // Handle encryption (AES-128)
  useEffect(() => {
    if (!enableEncryption || !encryptionKey || !hlsRef.current) return;

    // In production, this would decrypt segments
    // For demo purposes, we just log that encryption is enabled
    console.log(
      "Video encryption enabled with key:",
      encryptionKey.substring(0, 8) + "..."
    );
  }, [enableEncryption, encryptionKey]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleError = () => {
      setError("Failed to load video");
      onError?.();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [onEnded, onError]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "arrowleft":
        case "j":
          seek(-10);
          break;
        case "arrowright":
        case "l":
          seek(10);
          break;
        case "arrowup":
          adjustVolume(0.1);
          break;
        case "arrowdown":
          adjustVolume(-0.1);
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          seekTo((parseInt(e.key) / 10) * duration);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [duration]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeoutRef.current);
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener("mousemove", handleMouseMove);

    return () => {
      container?.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Control functions
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const adjustVolume = useCallback(
    (delta) => {
      const video = videoRef.current;
      if (!video) return;

      const newVolume = Math.max(0, Math.min(1, volume + delta));
      video.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        video.muted = false;
      }
    },
    [volume, isMuted]
  );

  const seek = useCallback(
    (delta) => {
      const video = videoRef.current;
      if (!video) return;

      video.currentTime = Math.max(0, Math.min(duration, currentTime + delta));
    },
    [currentTime, duration]
  );

  const seekTo = useCallback((time) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleQualityChange = useCallback((qualityIndex) => {
    setCurrentQuality(qualityIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = qualityIndex;
    }
  }, []);

  const handleAudioTrackChange = useCallback(
    (trackIndex) => {
      setActiveAudioTrack(trackIndex);
      if (hlsRef.current) {
        hlsRef.current.audioTrack = trackIndex;
      }
      onAudioTrackChange?.(trackIndex);
    },
    [onAudioTrackChange]
  );

  const handlePlaybackRateChange = useCallback((rate) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  // Format time helper
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress percentage
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`${styles.player} ${isFullscreen ? styles.fullscreen : ""}`}
      onClick={togglePlay}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={styles.video}
        poster={poster}
        playsInline
        onClick={(e) => e.stopPropagation()}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className={styles.loader}>
          <Loader2 className={styles.spinner} size={48} />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.error}>
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      {title && <div className={styles.title}>{title}</div>}

      {/* Controls Overlay */}
      <div
        className={`${styles.controls} ${showControls ? styles.visible : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.buffered}
              style={{ width: `${bufferedPercent}%` }}
            />
            <div
              className={styles.progress}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className={styles.bottomControls}>
          {/* Left Controls */}
          <div className={styles.leftControls}>
            <button
              className={styles.controlButton}
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button
              className={styles.controlButton}
              onClick={() => seek(-10)}
              aria-label='Rewind 10 seconds'
            >
              <SkipBack size={20} />
            </button>

            <button
              className={styles.controlButton}
              onClick={() => seek(10)}
              aria-label='Forward 10 seconds'
            >
              <SkipForward size={20} />
            </button>

            <div className={styles.volumeControl}>
              <button
                className={styles.controlButton}
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type='range'
                min='0'
                max='1'
                step='0.1'
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  videoRef.current.volume = newVolume;
                  setVolume(newVolume);
                  if (newVolume > 0 && isMuted) {
                    setIsMuted(false);
                  }
                }}
                className={styles.volumeSlider}
                aria-label='Volume'
              />
            </div>

            <span className={styles.time}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className={styles.rightControls}>
            {/* Settings */}
            <div className={styles.settingsWrapper}>
              <button
                className={styles.controlButton}
                onClick={() => setShowSettings(!showSettings)}
                aria-label='Settings'
              >
                <Settings size={20} />
              </button>

              {showSettings && (
                <div className={styles.settingsMenu}>
                  {/* Quality Selection */}
                  {availableQualities.length > 0 && (
                    <div className={styles.settingsSection}>
                      <span className={styles.settingsLabel}>Quality</span>
                      <div className={styles.settingsOptions}>
                        {availableQualities.map((quality) => (
                          <button
                            key={quality.index}
                            className={`${styles.settingsOption} ${
                              currentQuality === quality.index
                                ? styles.active
                                : ""
                            }`}
                            onClick={() => handleQualityChange(quality.index)}
                          >
                            {quality.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio Tracks */}
                  {audioTracks.length > 0 && (
                    <div className={styles.settingsSection}>
                      <span className={styles.settingsLabel}>Audio</span>
                      <div className={styles.settingsOptions}>
                        {audioTracks.map((track, index) => (
                          <button
                            key={index}
                            className={`${styles.settingsOption} ${
                              activeAudioTrack === index ? styles.active : ""
                            }`}
                            onClick={() => handleAudioTrackChange(index)}
                          >
                            {track.label || `Track ${index + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Playback Speed */}
                  <div className={styles.settingsSection}>
                    <span className={styles.settingsLabel}>Speed</span>
                    <div className={styles.settingsOptions}>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          className={`${styles.settingsOption} ${
                            playbackRate === rate ? styles.active : ""
                          }`}
                          onClick={() => handlePlaybackRateChange(rate)}
                        >
                          {rate === 1 ? "Normal" : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              className={styles.controlButton}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Play/Pause Overlay for large click area */}
      {!isPlaying && !isLoading && (
        <div className={styles.playOverlay}>
          <Play size={64} />
        </div>
      )}
    </div>
  );
}

VideoPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  title: PropTypes.string,
  onEnded: PropTypes.func,
  onError: PropTypes.func,
  autoPlay: PropTypes.bool,
  initialQuality: PropTypes.number,
  enableEncryption: PropTypes.bool,
  encryptionKey: PropTypes.string,
  audioTracks: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      language: PropTypes.string,
      url: PropTypes.string
    })
  ),
  onAudioTrackChange: PropTypes.func
};
