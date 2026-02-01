import styles from "../SimilarMovies/SimilarMovies.module.css";
import useFetchMovies from "../../hook/useMoviesFetch";
import PropTypes from "prop-types";

export default function SimilarMovies({
  API_KEY,
  BASE_URL,
  IMAGE_PATH,
  genre,
  detail,
}) {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre}&page=2`;
  const { movies: latestMovies, loading, error } = useFetchMovies(url);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      {loading ? (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <div className={styles.carouselSimilar}>
          {latestMovies.map((movie) => (
            <div className={styles.movieCommon} key={movie.id}>
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
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

SimilarMovies.propTypes = {
  API_KEY: PropTypes.string.isRequired,
  BASE_URL: PropTypes.string.isRequired,
  IMAGE_PATH: PropTypes.string.isRequired,
  genre: PropTypes.string.isRequired,
  detail: PropTypes.func,
};
