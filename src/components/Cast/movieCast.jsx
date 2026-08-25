import styles from "../Cast/MovieCast.module.css";
import PropTypes from "prop-types";

export default function MovieCast({ cast }) {
  return (
    <>
      <h2 className={styles.h2}>Top Cast</h2>
      <div className={styles.cast}>
        {cast.map((actor) => (
          <div key={actor.id} className={styles.profiles}>
            <img
              src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
              alt={actor.name}
            />
            <div className={styles.perso}>
              <h4>{actor.name}</h4>
              <h6>{actor.character}</h6>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

MovieCast.propTypes = {
  cast: PropTypes.object,
};
