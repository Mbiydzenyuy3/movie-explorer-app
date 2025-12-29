import LatestMovies from "../components/LatestMovies/LatestMovies";
import MoviesLayout from "../components/MoviesLayout/MoviesLayout";
import TopSearches from "../components/TopSearches/TopSearches";
import HeroSection from "../components/HeroSection/HeroCard";
import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { useNavigate } from "react-router";
import useFetchMovies from "../hook/useMoviesFetch";

export default function Homepage() {
  const { setSelectedMovie, apiKey, baseUrl, IMAGE_PATH } =
    useContext(MoviesContext);
  const navigate = useNavigate();

  console.log(apiKey);

  const popularUrl = `${baseUrl}/movie/popular?api_key=${apiKey}`;
  const { movies: popularMovies } = useFetchMovies(popularUrl);
  const heroMovie = popularMovies ? popularMovies[0] : null;

  const handleMovieDetail = (movie) => {
    console.log(movie);
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  return (
    <>
      <Header />
      {heroMovie && (
        <HeroSection
          title={heroMovie.title}
          description={heroMovie.overview}
          movie={heroMovie}
          storage={handleMovieDetail}
          IMAGE_PATH={IMAGE_PATH}
        />
      )}
      <LatestMovies
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        genre={80}
        detail={handleMovieDetail}
      />

      <TopSearches
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        path='popular'
        genre={27}
        detail={handleMovieDetail}
      />
      <MoviesLayout
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        title='Action'
        genre={53}
        detail={handleMovieDetail}
      />
      <MoviesLayout
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        title='Romance & Drama'
        genre={10749}
        detail={handleMovieDetail}
      />
      <MoviesLayout
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        title='Comedy'
        genre={37}
        detail={handleMovieDetail}
      />

      <Footer />
    </>
  );
}
