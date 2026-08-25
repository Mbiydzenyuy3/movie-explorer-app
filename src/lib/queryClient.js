import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Don't refetch on window focus (reduces API calls)
      refetchOnWindowFocus: false,
      // Retry failed requests 3 times
      retry: 3,
      // Timeout after 10 seconds
      timeout: 10000,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  movies: {
    all: ['movies'],
    lists: () => [...queryKeys.movies.all, 'list'],
    list: (key, filters) => [...queryKeys.movies.lists(), key, filters],
    details: () => [...queryKeys.movies.all, 'detail'],
    detail: (id) => [...queryKeys.movies.details(), id],
    search: (query) => [...queryKeys.movies.all, 'search', query],
  },
  genres: {
    all: ['genres'],
    list: () => [...queryKeys.genres.all, 'list'],
  },
  trending: {
    all: ['trending'],
    daily: () => [...queryKeys.trending.all, 'daily'],
    weekly: () => [...queryKeys.trending.all, 'weekly'],
  },
  credits: {
    all: ['credits'],
    movie: (id) => [...queryKeys.credits.all, 'movie', id],
  },
  videos: {
    all: ['videos'],
    movie: (id) => [...queryKeys.videos.all, 'movie', id],
  },
};
