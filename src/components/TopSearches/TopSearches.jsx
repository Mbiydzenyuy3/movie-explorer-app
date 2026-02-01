import styles from "../TopSearches/TopSearches.module.css";
import useFetchMovies from "../../hook/useMoviesFetch";
import PropTypes from "prop-types";

export default function TopSearches({
  API_KEY,
  BASE_URL,
  IMAGE_PATH,
  path,
  detail,
}) {
  const popularUrl = `${BASE_URL}/movie/${path}?api_key=${API_KEY}`;

  const { movies: latestMovies, loading, error } = useFetchMovies(popularUrl);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div className={styles.headerCarousel}>
        <h1>Top Searches</h1>
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <div className={styles.carouselTopSearch}>
          {latestMovies.map((movie) => (
            <div className={styles.movieTopSearch} key={movie.id}>
              <img
                src={
                  movie.poster_path
                    ? `${IMAGE_PATH}${movie.poster_path}`
                    : "fallback_image_url"
                }
                alt={movie.title}
                onClick={() => detail(movie)}
              />
              <div className="movie-meta">
                <h3 className="movie-title">{movie.title}</h3>
                <span className="movie-rate">
                  ⭐ {movie.vote_average.toFixed(1)}
                </span>
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

TopSearches.propTypes = {
  API_KEY: PropTypes.string.isRequired,
  BASE_URL: PropTypes.string.isRequired,
  IMAGE_PATH: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  detail: PropTypes.func,
};
