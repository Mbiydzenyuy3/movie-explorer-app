
import fetchMovies from "../../services/api-services";
import MovieCard from "../MovieCard/MovieCard";

export default function RomanceDramaMovies() {
  const { romanceDramaMovies } = fetchMovies();

  return (
    <div className="romance-movies">
      {romanceDramaMovies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
