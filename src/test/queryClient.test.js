import { describe, it, expect } from "vitest";
import { queryClient, queryKeys } from "../lib/queryClient";

describe("Query Client Configuration", () => {
  it("should have default stale time of 5 minutes", () => {
    expect(queryClient.getDefaultOptions().queries.staleTime).toBe(
      5 * 60 * 1000
    );
  });

  it("should have gc time of 30 minutes", () => {
    expect(queryClient.getDefaultOptions().queries.gcTime).toBe(30 * 60 * 1000);
  });

  it("should not refetch on window focus", () => {
    expect(queryClient.getDefaultOptions().queries.refetchOnWindowFocus).toBe(
      false
    );
  });

  it("should retry 3 times on failure", () => {
    expect(queryClient.getDefaultOptions().queries.retry).toBe(3);
  });
});

describe("Query Keys", () => {
  describe("movies", () => {
    it("should generate correct movies.all key", () => {
      expect(queryKeys.movies.all).toEqual(["movies"]);
    });

    it("should generate correct movies.lists key", () => {
      expect(queryKeys.movies.lists()).toEqual(["movies", "list"]);
    });

    it("should generate correct movies.list key with filters", () => {
      expect(queryKeys.movies.list("popular", { page: 1 })).toEqual([
        "movies",
        "list",
        "popular",
        { page: 1 }
      ]);
    });

    it("should generate correct movies.detail key", () => {
      expect(queryKeys.movies.detail(123)).toEqual(["movies", "detail", 123]);
    });

    it("should generate correct movies.search key", () => {
      expect(queryKeys.movies.search("test")).toEqual([
        "movies",
        "search",
        "test"
      ]);
    });
  });

  describe("genres", () => {
    it("should generate correct genres.all key", () => {
      expect(queryKeys.genres.all).toEqual(["genres"]);
    });

    it("should generate correct genres.list key", () => {
      expect(queryKeys.genres.list()).toEqual(["genres", "list"]);
    });
  });

  describe("trending", () => {
    it("should generate correct trending.all key", () => {
      expect(queryKeys.trending.all).toEqual(["trending"]);
    });

    it("should generate correct trending.daily key", () => {
      expect(queryKeys.trending.daily()).toEqual(["trending", "daily"]);
    });

    it("should generate correct trending.weekly key", () => {
      expect(queryKeys.trending.weekly()).toEqual(["trending", "weekly"]);
    });
  });
});
