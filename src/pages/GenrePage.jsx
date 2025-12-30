import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import MoviesLayout from "../components/MoviesLayout/MoviesLayout";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router";

export default function GenrePage() {
  const { setSelectedMovie, apiKey, baseUrl, IMAGE_PATH } =
    useContext(MoviesContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleMovieDetail = (movie) => {
    setSelectedMovie(movie);
    navigate(`/details/${movie.id}`);
  };

  return (
    <>
      <Header />
      <div style={{ paddingTop: "80px" }}>
        <MoviesLayout
          API_KEY={apiKey}
          BASE_URL={baseUrl}
          IMAGE_PATH={IMAGE_PATH}
          title={`Movies in Genre ${id}`}
          genre={id}
          type='movie'
          detail={handleMovieDetail}
        />
      </div>
      <Footer />
    </>
  );
}
