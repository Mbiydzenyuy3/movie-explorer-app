import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import styles from "./MovieCarousel.module.css";

export default function MovieCarousel({
  title,
  movies,
  IMAGE_PATH,
  onMovieClick,
  renderCard,
  showProgress = false
}) {
  const scrollRef = useRef(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth * 0.7;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 0);
      setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const renderMovieCard = (movie) => {
    if (renderCard) {
      return renderCard(movie);
    }

    // Default card rendering
    return (
      <div
        className={styles.movieCard}
        onClick={() => onMovieClick(movie)}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onMovieClick(movie);
          }
        }}
        aria-label={`${movie.title || movie.name}, rated ${movie.vote_average?.toFixed(1) || "N/A"}`}
      >
        <div className={styles.posterWrapper}>
          {movie.poster_path ? (
            <img
              src={`${IMAGE_PATH}${movie.poster_path}`}
              alt={movie.title || movie.name}
              className={styles.poster}
              loading='lazy'
            />
          ) : (
            <div className={styles.noPoster}>
              <span>{movie.title?.charAt(0) || movie.name?.charAt(0)}</span>
            </div>
          )}
          <div className={styles.overlay}>
            <div className={styles.playIcon}>▶</div>
          </div>
          {showProgress && movie.progress !== undefined && (
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${Math.max(2, movie.progress)}%` }} 
              />
            </div>
          )}
        </div>
        <div className={styles.movieInfo}>
          <h3 className={styles.movieTitle}>{movie.title || movie.name}</h3>
          <div className={styles.meta}>
            <span className={styles.rating}>
              ★ {movie.vote_average?.toFixed(1) || "N/A"}
            </span>
            <span className={styles.year}>
              {new Date(
                movie.release_date || movie.first_air_date
              ).getFullYear() || "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.carouselContainer}>
      {title && (
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
      )}

      <div className={styles.wrapper}>
        {/* Left Navigation Button */}
        {showLeftBtn && (
          <button
            className={`${styles.navButton} ${styles.leftButton}`}
            onClick={() => scroll("left")}
            aria-label='Scroll left'
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Carousel Track */}
        <div
          className={styles.carousel}
          ref={scrollRef}
          onScroll={handleScroll}
          role='list'
          aria-label={`${title || "Movies"} carousel`}
        >
          {movies.map((movie) => (
            <div key={movie.id} className={styles.cardWrapper} role='listitem'>
              {renderMovieCard(movie)}
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        {showRightBtn && (
          <button
            className={`${styles.navButton} ${styles.rightButton}`}
            onClick={() => scroll("right")}
            aria-label='Scroll right'
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>
    </div>
  );
}

MovieCarousel.propTypes = {
  title: PropTypes.string,
  movies: PropTypes.array.isRequired,
  IMAGE_PATH: PropTypes.string,
  onMovieClick: PropTypes.func.isRequired,
  renderCard: PropTypes.func,
  showProgress: PropTypes.bool
};
