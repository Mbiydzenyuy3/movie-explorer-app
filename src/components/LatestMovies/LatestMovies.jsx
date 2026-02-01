import styles from "./LatestMovies.module.css";
import useFetchMovies from "../../hook/useMoviesFetch";
import PropTypes from "prop-types";

export default function LatestMovies({
  API_KEY,
  BASE_URL,
  IMAGE_PATH,
  detail,
}) {
  const latestUrl = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`;

  const { movies: latestMovies, loading, error } = useFetchMovies(latestUrl);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div className={styles.headerCarousel}>
        <h1>Latest & Trending</h1>
      </div>
      {loading ? (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <div className={styles.carousel}>
          {latestMovies.map((movie, index) => (
            <div className={styles.movie} key={movie.id}>
              <span className={styles.number}>{index + 1}</span>
              <img
                src={
                  movie.poster_path
                    ? `${IMAGE_PATH}${movie.poster_path}`
                    : "fallback_image_url"
                }
                alt={movie.title}
                onClick={() => detail(movie)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

LatestMovies.propTypes = {
  API_KEY: PropTypes.string.isRequired,
  BASE_URL: PropTypes.string.isRequired,
  IMAGE_PATH: PropTypes.string.isRequired,
  detail: PropTypes.func,
};
