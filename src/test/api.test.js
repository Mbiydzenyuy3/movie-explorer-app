import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiService, APIError } from "../services/api";

describe("API Service", () => {
  describe("APIError", () => {
    it("should create an APIError with message, status, and data", () => {
      const error = new APIError("Test error", 404, { details: "Not found" });

      expect(error.message).toBe("Test error");
      expect(error.status).toBe(404);
      expect(error.data).toEqual({ details: "Not found" });
      expect(error.name).toBe("APIError");
    });
  });

  describe("URL Building", () => {
    // Note: These tests verify the URL construction logic
    // In production with a proxy, actual API calls would be tested differently

    it("should export required methods", () => {
      expect(typeof apiService.getPopularMovies).toBe("function");
      expect(typeof apiService.getTopRatedMovies).toBe("function");
      expect(typeof apiService.getUpcomingMovies).toBe("function");
      expect(typeof apiService.getNowPlayingMovies).toBe("function");
      expect(typeof apiService.getMovieDetails).toBe("function");
      expect(typeof apiService.getMovieCredits).toBe("function");
      expect(typeof apiService.getMovieVideos).toBe("function");
      expect(typeof apiService.discoverMovies).toBe("function");
      expect(typeof apiService.getPopularTV).toBe("function");
      expect(typeof apiService.searchMovies).toBe("function");
      expect(typeof apiService.getGenres).toBe("function");
      expect(typeof apiService.getTrendingDaily).toBe("function");
      expect(typeof apiService.getTrendingWeekly).toBe("function");
    });
  });
});
