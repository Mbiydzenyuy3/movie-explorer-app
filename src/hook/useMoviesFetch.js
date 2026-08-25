import { useState, useEffect } from "react";
import { fetchMovies } from "../services/api-services";

const useFetchMovies = (url) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    // Guards against a slow response for a previous url overwriting the
    // results of a newer one.
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchMovies(url)
      .then((data) => {
        if (cancelled) return;
        setMovies(data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching movies:", err);
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { movies, loading, error };
};

export default useFetchMovies;
