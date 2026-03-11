import styles from "../HeroSection/HeroSection.module.css";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { Play, Info } from "lucide-react";

export default function HeroSection({ movies, storage, IMAGE_PATH }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  const backgroundImage = currentMovie.backdrop_path
    ? `url(${IMAGE_PATH}${currentMovie.backdrop_path})`
    : `url(${IMAGE_PATH}${currentMovie.poster_path})`;

  const handleWatchClick = () => {
    // Navigate to movie details page
    if (storage) {
      storage(currentMovie);
    }
  };

  const handleInfoClick = () => {
    if (storage) {
      storage(currentMovie);
    }
  };

  return (
    <div className={styles.heroSection} style={{ backgroundImage }}>
      <div className={styles.overlay} />
      <div className={styles.movieDetail}>
        <h1 className={styles.title}>{currentMovie.title}</h1>
        <p className={styles.movieDescription}>
          {currentMovie.overview?.slice(0, 150)}...
        </p>

        <div className={styles.heroBtns}>
          {/* Watch Button - Red */}
          <button className={styles.watchBtn} onClick={handleWatchClick}>
            <Play size={20} fill='currentColor' />
            <span>Watch Now</span>
          </button>

          {/* More Info Button */}
          <button className={styles.infoBtn} onClick={handleInfoClick}>
            <Info size={18} />
            <span>More Info</span>
          </button>
        </div>

        {/* Movie Indicators */}
        <div className={styles.indicators}>
          {movies.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

HeroSection.propTypes = {
  movies: PropTypes.arrayOf(PropTypes.object).isRequired,
  storage: PropTypes.func.isRequired,
  IMAGE_PATH: PropTypes.string.isRequired
};
