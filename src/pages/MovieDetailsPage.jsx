import { MoviesContext } from "../context/movieContext";
import { useParams } from "react-router";
import { useContext, useState, useEffect } from "react";
import MovieCast from "../components/Cast/movieCast";
import DetailsHeroSection from "../components/detailsHeroSection/detailHeroSection";
import SimilarMovies from "../components/SimilarMovies/SimilarMovies";
import { useNavigate } from "react-router";
import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import styles from "../components/SimilarMovies/SimilarMovies.module.css";

export default function DetailPage() {
  const { selectedMovie, apiKey, baseUrl, IMAGE_PATH, setSelectedMovie } =
    useContext(MoviesContext);
  const { id } = useParams();
  const [cast, setCast] = useState([]);
  const navigate = useNavigate();

  const handleMovieDetail = (movie) => {
    console.log(movie);
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  const handleStorage = (movie) => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    const isMovieInWatchlist = watchlist.some((item) => {
      item.id === movie.id;
    });

    if (!isMovieInWatchlist) {
      watchlist.push(movie);

      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      console.log(movie.title);

      alert(`movie added to watchlist: ${movie.title}`);
    } else {
      alert(`Movie is already in the watchlist: ${movie.title}`);
    }
  };

  // Fetch Cast Data
  useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/movie/${id}/credits?api_key=${apiKey}`
        );
        const data = await response.json();
        setCast(data.cast.slice(0, 6)); // Get the top 6 cast members
      } catch (error) {
        console.error("Error fetching cast:", error);
      }
    };

    fetchCast();
  }, [id]);

  // Incase movie isn't found
  if (!selectedMovie || selectedMovie.id !== parseInt(id)) {
    return (
      <div className="error-container">
        <h1>Movie Not Found</h1>
        <p>
          The movie you are looking for does not exist. Please go back and
          select a valid movie.
        </p>
        <a href="/" className="back-button">
          Go Back
        </a>
      </div>
    );
  }

  return (
    <>
      <Header />
      <DetailsHeroSection
        backgroundImage={
          selectedMovie.backdrop_path
            ? selectedMovie.backdrop_path
            : selectedMovie.poster_path
        }
        description={selectedMovie.overview}
        title={selectedMovie.title}
        storage={handleStorage}
        movie={selectedMovie}
      />
      <MovieCast cast={cast} />

      <div className={styles.headerCarousel}>
        <h1 className="h1-detail">More Like this</h1>
        <button className={styles.nextMovie}>
          View More
          <svg
            width="7"
            height="11"
            viewBox="0 0 7 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.230252 10.7697C0.0828219 10.6223 0 10.4223 0 10.2138C0 10.0052 0.0828219 9.80523 0.230252 9.65775L4.39276 5.49525L0.230252 1.33275C0.0870001 1.18443 0.00773378 0.985779 0.00952556 0.779583C0.0113173 0.573387 0.0940238 0.376144 0.239832 0.230336C0.38564 0.0845283 0.582883 0.00182152 0.789079 2.97285e-05C0.995275 -0.00176206 1.19393 0.0775046 1.34224 0.220757L6.06074 4.93926C6.20818 5.08673 6.291 5.28672 6.291 5.49525C6.291 5.70378 6.20818 5.90377 6.06074 6.05125L1.34224 10.7697C1.19477 10.9172 0.994778 11 0.786249 11C0.577719 11 0.377727 10.9172 0.230252 10.7697Z"
              fill="white"
            />
          </svg>
        </button>
      </div>

      <SimilarMovies
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        genre={selectedMovie.genre_ids[0]}
        detail={handleMovieDetail}
      />

      <SimilarMovies
        API_KEY={apiKey}
        BASE_URL={baseUrl}
        IMAGE_PATH={IMAGE_PATH}
        genre={selectedMovie.genre_ids[1]}
        detail={handleMovieDetail}
      />

      <Footer />
    </>
  );
}
