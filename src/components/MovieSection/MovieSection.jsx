import styles from "../MoviesLayout/MoviesLayout.module.css";
import useFetchMovies from "../../hook/useMoviesFetch";
import PropTypes from "prop-types";

export default function MovieSection({
  API_KEY,
  BASE_URL,
  IMAGE_PATH,
  title,
  url,
  detail
}) {
  const fullUrl = `${BASE_URL}${url}?api_key=${API_KEY}`;
  const { movies: sectionMovies, loading, error } = useFetchMovies(fullUrl);

  if (loading)
    return (
      <div className={styles.common}>
        <div className='spinner'></div>
      </div>
    );
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div className={styles.headerCarousel}>
        <h1>{title}</h1>
      </div>
      <div className={styles.carouselCommon}>
        {sectionMovies.map((movie) => (
          <div className={styles.movieCommon} key={movie.id}>
            <img
              src={
                movie.poster_path
                  ? `${IMAGE_PATH}${movie.poster_path}`
                  : "/assets/img/placeholder.png"
              }
              alt={movie.title || movie.name}
              onClick={() => detail(movie)}
            />
            <div className='movie-meta'>
              <h3 className='movie-title'>{movie.title || movie.name}</h3>
              <span>⭐ {movie.vote_average.toFixed(1)}</span>
              <span>
                {new Date(
                  movie.release_date || movie.first_air_date
                ).getFullYear()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

MovieSection.propTypes = {
  API_KEY: PropTypes.string.isRequired,
  BASE_URL: PropTypes.string.isRequired,
  IMAGE_PATH: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  detail: PropTypes.func
};
