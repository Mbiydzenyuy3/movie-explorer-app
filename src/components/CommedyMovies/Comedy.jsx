import useMovies from "../../hook/moviesFetch";
import MovieCard from "../MovieCard/MovieCard";

export default function ComedyMovies() {
  const { comedyMovies } = useMovies();

  return (
    <div className="comedy-movies">
      {comedyMovies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
