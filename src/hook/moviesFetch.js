import { useState, useEffect } from "react";
import fetchMovies from "../services/api-services";

const useFetchMovies = (url) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getMovies = (url) => {
    fetchMovies(url).then((data) => {
      if (data) {
        setMovies(data);
        setLoading(false);
      }
      setError(error);
    });
  };

  useEffect(() => {
    getMovies(url);
  }, [url]); // Re-run effect when the URL changes

  return { movies, loading, error };
};

export default useFetchMovies;
