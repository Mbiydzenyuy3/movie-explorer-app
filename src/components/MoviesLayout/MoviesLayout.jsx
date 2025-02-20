import styles from "../MoviesLayout/MoviesLayout.module.css";
import useFetchMovies from "../../hook/useMoviesFetch";
import PropTypes from "prop-types";

export default function MoviesLayout({
  API_KEY,
  BASE_URL,
  IMAGE_PATH,
  title,
  genre,
  detail,
}) {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre}`;
  const { movies: latestMovies, loading, error } = useFetchMovies(url);

  if (loading)
    return (
      <div className={styles.common}>
        <div className="spinner"></div>
      </div>
    );
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div className={styles.headerCarousel}>
        <h1>{title}</h1>
      </div>
      <div className={styles.carouselCommon}>
        {latestMovies.map((movie) => (
          <div className={styles.movieCommon} key={movie.id}>
            <img
              src={
                movie.poster_path ? (
                  `${IMAGE_PATH}${movie.poster_path}`
                ) : (
                  <div className="spinner"></div>
                )
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
    </>
  );
}

MoviesLayout.propTypes = {
  API_KEY: PropTypes.string.isRequired,
  BASE_URL: PropTypes.string.isRequired,
  IMAGE_PATH: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  genre: PropTypes.string.isRequired,
  detail: PropTypes.func,
};
