import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import { MoviesContext } from "../context/movieContext";
import { useContext } from "react";
import { useNavigate } from "react-router";
import useFetchGenres from "../hook/useFetchGenres";
import styles from "./CategoriesPage.module.css";

export default function CategoriesPage() {
  const { apiKey, baseUrl } = useContext(MoviesContext);
  const navigate = useNavigate();

  const genresUrl = `${baseUrl}/genre/movie/list?api_key=${apiKey}`;
  const { genres, loading, error } = useFetchGenres(genresUrl);

  const handleGenreClick = (genreId) => {
    navigate(`/categories/${genreId}`);
  };

  if (loading)
    return (
      <>
        <Header />
        <div
          className={styles.categoriesContainer}
          style={{ textAlign: "center" }}
        >
          <div className='spinner'></div>
        </div>
        <Footer />
      </>
    );
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <Header />
      <div className={styles.categoriesContainer}>
        <h1 className={styles.categoriesTitle}>Movie Categories</h1>
        <div className={styles.categoriesGrid}>
          {genres.map((genre) => (
            <div
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className={styles.categoryCard}
            >
              <h3>{genre.name}</h3>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
