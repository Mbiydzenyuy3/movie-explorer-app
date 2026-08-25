import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { queryKeys } from "../lib/queryClient";

// ==================== Movie Hooks ====================

/**
 * Hook for fetching popular movies with caching
 */
export const usePopularMovies = () => {
  return useQuery({
    queryKey: queryKeys.movies.list("popular"),
    queryFn: () => apiService.getPopularMovies().then((res) => res.results),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook for fetching top rated movies
 */
export const useTopRatedMovies = () => {
  return useQuery({
    queryKey: queryKeys.movies.list("top-rated"),
    queryFn: () => apiService.getTopRatedMovies().then((res) => res.results)
  });
};

/**
 * Hook for fetching upcoming movies
 */
export const useUpcomingMovies = () => {
  return useQuery({
    queryKey: queryKeys.movies.list("upcoming"),
    queryFn: () => apiService.getUpcomingMovies().then((res) => res.results)
  });
};

/**
 * Hook for fetching now playing movies
 */
export const useNowPlayingMovies = () => {
  return useQuery({
    queryKey: queryKeys.movies.list("now-playing"),
    queryFn: () => apiService.getNowPlayingMovies().then((res) => res.results)
  });
};

/**
 * Hook for fetching movie details
 */
export const useMovieDetails = (movieId) => {
  return useQuery({
    queryKey: queryKeys.movies.detail(movieId),
    queryFn: () => apiService.getMovieDetails(movieId),
    enabled: !!movieId
  });
};

/**
 * Hook for fetching movie credits
 */
export const useMovieCredits = (movieId) => {
  return useQuery({
    queryKey: queryKeys.credits.movie(movieId),
    queryFn: () => apiService.getMovieCredits(movieId).then((res) => res.cast),
    enabled: !!movieId
  });
};

/**
 * Hook for fetching movie videos
 */
export const useMovieVideos = (movieId) => {
  return useQuery({
    queryKey: queryKeys.videos.movie(movieId),
    queryFn: () =>
      apiService.getMovieVideos(movieId).then((res) => res.results),
    enabled: !!movieId
  });
};

/**
 * Hook for discovering movies by genre
 */
export const useDiscoverMovies = (genre, page = 1) => {
  return useQuery({
    queryKey: queryKeys.movies.list("discover", { genre, page }),
    queryFn: () =>
      apiService.discoverMovies(genre, page).then((res) => res.results),
    enabled: !!genre
  });
};

/**
 * Hook for discovering movies by mood, time limit, and energy level
 */
export const useMoodMovies = (mood, timeLimit = 0, page = 1) => {
  return useQuery({
    queryKey: queryKeys.movies.list("mood", { mood, timeLimit, page }),
    queryFn: () =>
      apiService
        .discoverByMood(mood, timeLimit, page)
        .then((res) => res.results),
    enabled: !!mood,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// ==================== TV Series Hooks ====================

/**
 * Hook for fetching popular TV shows
 */
export const usePopularTV = () => {
  return useQuery({
    queryKey: ["tv", "popular"],
    queryFn: () => apiService.getPopularTV().then((res) => res.results)
  });
};

/**
 * Hook for fetching top rated TV shows
 */
export const useTopRatedTV = () => {
  return useQuery({
    queryKey: ["tv", "top-rated"],
    queryFn: () => apiService.getTopRatedTV().then((res) => res.results)
  });
};

/**
 * Hook for fetching on the air TV shows
 */
export const useOnTheAirTV = () => {
  return useQuery({
    queryKey: ["tv", "on-the-air"],
    queryFn: () => apiService.getOnTheAirTV().then((res) => res.results)
  });
};

/**
 * Hook for fetching airing today TV shows
 */
export const useAiringTodayTV = () => {
  return useQuery({
    queryKey: ["tv", "airing-today"],
    queryFn: () => apiService.getAiringTodayTV().then((res) => res.results)
  });
};

// ==================== Search Hooks ====================

/**
 * Hook for searching movies
 */
export const useSearchMovies = (query) => {
  return useQuery({
    queryKey: queryKeys.movies.search(query),
    queryFn: () => apiService.searchMovies(query).then((res) => res.results),
    enabled: query.length > 1
  });
};

// ==================== Genre Hooks ====================

/**
 * Hook for fetching movie genres
 */
export const useGenres = () => {
  return useQuery({
    queryKey: queryKeys.genres.list(),
    queryFn: () => apiService.getGenres().then((res) => res.genres),
    staleTime: 24 * 60 * 60 * 1000 // 24 hours - genres rarely change
  });
};

// ==================== Trending Hooks ====================

/**
 * Hook for fetching daily trending content
 */
export const useTrendingDaily = () => {
  return useQuery({
    queryKey: queryKeys.trending.daily(),
    queryFn: () => apiService.getTrendingDaily().then((res) => res.results)
  });
};

/**
 * Hook for fetching weekly trending content
 */
export const useTrendingWeekly = () => {
  return useQuery({
    queryKey: queryKeys.trending.weekly(),
    queryFn: () => apiService.getTrendingWeekly().then((res) => res.results)
  });
};

// ==================== Mutation Hooks ====================

/**
 * Hook for invalidating movie cache
 */
export const useInvalidateMovies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.movies.all });
    }
  });
};

export default {
  usePopularMovies,
  useTopRatedMovies,
  useUpcomingMovies,
  useNowPlayingMovies,
  useMovieDetails,
  useMovieCredits,
  useMovieVideos,
  useDiscoverMovies,
  useMoodMovies,
  usePopularTV,
  useTopRatedTV,
  useOnTheAirTV,
  useAiringTodayTV,
  useSearchMovies,
  useGenres,
  useTrendingDaily,
  useTrendingWeekly
};
