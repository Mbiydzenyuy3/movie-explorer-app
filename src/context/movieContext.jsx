// movieContext.jsx
import { useState } from "react";
import PropTypes from "prop-types";

import { MoviesContext } from "./MoviesContextObject";

export const DetailMovieData = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  // All TMDB traffic goes through our own proxy, which holds the API key
  // server-side. Nothing secret reaches the browser from here.
  const baseUrl = "/api/tmdb";
  const IMAGE_PATH = import.meta.env.VITE_BASE_IMG_PATH;

  return (
    <MoviesContext.Provider
      value={{ selectedMovie, setSelectedMovie, baseUrl, IMAGE_PATH }}
    >
      {children}
    </MoviesContext.Provider>
  );
};

DetailMovieData.propTypes = {
  children: PropTypes.node,
};
