import useMovies from "../../hook/moviesFetch";
import MovieCard from "../MovieCard/MovieCard";

const ActionMovies = () => {
  const { actionMovies } = useMovies();

  return (
    <div className="action-movies">
      {actionMovies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default ActionMovies;
