import styles from "../HeroSection/HeroSection.module.css";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Star, ChevronDown } from "lucide-react";

export default function HeroSection({ movies, storage, IMAGE_PATH }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const backgroundImage = currentMovie.backdrop_path
    ? `${IMAGE_PATH.replace("w500", "original")}${currentMovie.backdrop_path}`
    : `${IMAGE_PATH}${currentMovie.poster_path}`;

  const handleWatchClick = () => storage?.(currentMovie);
  const handleInfoClick = () => storage?.(currentMovie);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const rating = currentMovie.vote_average?.toFixed(1);

  return (
    <div className={styles.heroSection}>
      {/* Animated Background */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          className={styles.heroBg}
          style={{ backgroundImage: `url(${backgroundImage})` }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className={styles.overlayBottom} />
      <div className={styles.overlayLeft} />

      {/* Content */}
      <div className={styles.movieDetail}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={styles.contentWrapper}
          >
            {/* Rating badge */}
            {rating && (
              <motion.div
                className={styles.ratingBadge}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Star size={14} fill="currentColor" />
                <span>{rating}</span>
              </motion.div>
            )}

            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
            >
              {currentMovie.title || currentMovie.name}
            </motion.h1>

            <motion.p
              className={styles.movieDescription}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              {currentMovie.overview?.slice(0, 160)}...
            </motion.p>

            <motion.div
              className={styles.heroBtns}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <motion.button
                className={styles.watchBtn}
                onClick={handleWatchClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play size={20} fill="currentColor" />
                <span>Watch Now</span>
              </motion.button>

              <motion.button
                className={styles.infoBtn}
                onClick={handleInfoClick}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.97 }}
              >
                <Info size={18} />
                <span>More Info</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className={styles.indicators}>
          {movies.slice(0, 8).map((_, index) => (
            <motion.button
              key={index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                width: index === currentIndex ? 28 : 8,
                opacity: index === currentIndex ? 1 : 0.4
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className={styles.scrollHint}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </div>
  );
}

HeroSection.propTypes = {
  movies: PropTypes.arrayOf(PropTypes.object).isRequired,
  storage: PropTypes.func.isRequired,
  IMAGE_PATH: PropTypes.string.isRequired
};
