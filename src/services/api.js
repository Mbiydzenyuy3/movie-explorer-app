// API Service - Centralized API layer with proxy support
// All API calls go through this service to hide API keys

const API_BASE_URL = import.meta.env.VITE_API_PROXY_URL || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// API endpoints mapping
const endpoints = {
  // Movies
  popularMovies: "/movie/popular",
  topRatedMovies: "/movie/top_rated",
  upcomingMovies: "/movie/upcoming",
  nowPlayingMovies: "/movie/now_playing",
  movieDetails: (id) => `/movie/${id}`,
  movieCredits: (id) => `/movie/${id}/credits`,
  movieVideos: (id) => `/movie/${id}/videos`,
  discoverMovies: (genre) => `/discover/movie?with_genres=${genre}`,

  // TV Series
  popularTV: "/tv/popular",
  topRatedTV: "/tv/top_rated",
  onTheAirTV: "/tv/on_the_air",
  airingTodayTV: "/tv/airing_today",

  // Search
  searchMulti: (query) => `/search/movie?query=${encodeURIComponent(query)}`,

  // Genres
  genreList: "/genre/movie/list",

  // Trending
  trendingDaily: "/trending/all/day",
  trendingWeekly: "/trending/all/week"
};

/**
 * Build full API URL with proxy
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full URL
 */
const buildUrl = (endpoint) => {
  if (API_BASE_URL) {
    // Use proxy server
    return `${API_BASE_URL}${endpoint}`;
  }
  // Fallback to direct TMDB (requires API key in header)
  return `${TMDB_BASE_URL}${endpoint}`;
};

/**
 * Fetch with error handling
 * @param {string} url - Full URL
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
const fetchWithErrorHandling = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.status_message || `HTTP error! status: ${response.status}`,
        response.status,
        error
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new APIError("Request timeout", 408);
    }
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error.message || "Network error", 0);
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

// API Service Methods
export const apiService = {
  // Movies
  getPopularMovies: () =>
    fetchWithErrorHandling(buildUrl(endpoints.popularMovies)),

  getTopRatedMovies: () =>
    fetchWithErrorHandling(buildUrl(endpoints.topRatedMovies)),

  getUpcomingMovies: () =>
    fetchWithErrorHandling(buildUrl(endpoints.upcomingMovies)),

  getNowPlayingMovies: () =>
    fetchWithErrorHandling(buildUrl(endpoints.nowPlayingMovies)),

  getMovieDetails: (id) =>
    fetchWithErrorHandling(buildUrl(endpoints.movieDetails(id))),

  getMovieCredits: (id) =>
    fetchWithErrorHandling(buildUrl(endpoints.movieCredits(id))),

  getMovieVideos: (id) =>
    fetchWithErrorHandling(buildUrl(endpoints.movieVideos(id))),

  discoverMovies: (genre, page = 1) =>
    fetchWithErrorHandling(
      buildUrl(`${endpoints.discoverMovies(genre)}&page=${page}`)
    ),

  // TV Series
  getPopularTV: () => fetchWithErrorHandling(buildUrl(endpoints.popularTV)),

  getTopRatedTV: () => fetchWithErrorHandling(buildUrl(endpoints.topRatedTV)),

  getOnTheAirTV: () => fetchWithErrorHandling(buildUrl(endpoints.onTheAirTV)),

  getAiringTodayTV: () =>
    fetchWithErrorHandling(buildUrl(endpoints.airingTodayTV)),

  // Search
  searchMovies: (query) =>
    fetchWithErrorHandling(buildUrl(endpoints.searchMulti(query))),

  // Genres
  getGenres: () => fetchWithErrorHandling(buildUrl(endpoints.genreList)),

  // Trending
  getTrendingDaily: () =>
    fetchWithErrorHandling(buildUrl(endpoints.trendingDaily)),

  getTrendingWeekly: () =>
    fetchWithErrorHandling(buildUrl(endpoints.trendingWeekly))
};

export default apiService;
