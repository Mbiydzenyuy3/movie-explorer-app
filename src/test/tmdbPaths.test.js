import { describe, it, expect, vi } from "vitest";
import {
  isAllowedTmdbPath,
  buildTmdbUrl,
  fetchTmdb,
  parseTmdbRequest
} from "../../shared/tmdb-paths.js";

// This allowlist is the only thing stopping the proxy being an open relay to
// any TMDB route, so it gets tested from both directions.
describe("isAllowedTmdbPath", () => {
  const allowed = [
    "movie/550",
    "movie/550/credits",
    "movie/550/videos",
    "movie/550/watch/providers",
    "tv/1399",
    "tv/1399/season/2",
    "tv/1399/watch/providers",
    "discover/movie",
    "discover/tv",
    "search/movie",
    "search/multi",
    "trending/all/day",
    "genre/movie/list",
    "person/287",
    "watch/providers/regions",
    "watch/providers/movie"
  ];

  it.each(allowed)("allows %s", (path) => {
    expect(isAllowedTmdbPath(path)).toBe(true);
  });

  const blocked = [
    "account/lists",
    "account/1/favorite",
    "authentication/token/new",
    "list/123/add_item",
    "movie/550/rating",
    "guest_session/new",
    "",
    "../../account",
    "movie",
    "configuration"
  ];

  it.each(blocked)("blocks %s", (path) => {
    expect(isAllowedTmdbPath(path)).toBe(false);
  });
});

describe("buildTmdbUrl", () => {
  it("appends our key and preserves caller params", () => {
    const url = buildTmdbUrl("search/movie", "?query=parasite&page=2", "SECRET");

    expect(url).toContain("https://api.themoviedb.org/3/search/movie?");
    expect(url).toContain("query=parasite");
    expect(url).toContain("page=2");
    expect(url).toContain("api_key=SECRET");
  });

  it("ignores a caller-supplied api_key so ours always wins", () => {
    const url = buildTmdbUrl("movie/550", "?api_key=ATTACKER", "SECRET");

    expect(url).toContain("api_key=SECRET");
    expect(url).not.toContain("ATTACKER");
  });

  it("works with no caller query string", () => {
    expect(buildTmdbUrl("movie/550", "", "SECRET")).toBe(
      "https://api.themoviedb.org/3/movie/550?api_key=SECRET"
    );
  });
});

describe("fetchTmdb", () => {
  it("returns the response on success", async () => {
    const response = { status: 200 };
    global.fetch = vi.fn().mockResolvedValue(response);

    const result = await fetchTmdb("https://x", { retries: 0 });

    expect(result).toEqual({ ok: true, response });
  });

  it("retries before giving up", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("fetch failed"));

    const result = await fetchTmdb("https://x", {
      retries: 2,
      timeoutMs: 10,
      backoffMs: 0
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(result.ok).toBe(false);
    expect(result.timedOut).toBe(false);
  });

  // Retrying instantly hits the same transient failure; the pause is the point.
  it("waits between attempts", async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockResolvedValueOnce({ status: 200 });

    const start = Date.now();
    await fetchTmdb("https://x", { retries: 1, backoffMs: 60 });

    expect(Date.now() - start).toBeGreaterThanOrEqual(55);
  });

  it("succeeds if the retry works", async () => {
    const response = { status: 200 };
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockResolvedValueOnce(response);

    const result = await fetchTmdb("https://x", { retries: 1, backoffMs: 0 });

    expect(result).toEqual({ ok: true, response });
  });

  // A slow upstream must surface as 504, not an opaque 502.
  it("flags a timeout distinctly", async () => {
    const timeout = Object.assign(new Error("timed out"), { name: "TimeoutError" });
    global.fetch = vi.fn().mockRejectedValue(timeout);

    const result = await fetchTmdb("https://x", { retries: 0, timeoutMs: 50, backoffMs: 0 });

    expect(result.ok).toBe(false);
    expect(result.timedOut).toBe(true);
    expect(result.detail).toContain("50ms");
  });
});


// Both call sites feed this: the dev middleware sees a real path, production
// sees the path as a query param because vercel.json rewrites it there. The
// rewrite exists because a bracketed filename is a dynamic route, and Vercel
// resolves those after vercel.json rewrites — so the old catch-all function
// was deployed but unreachable, answering 404 in production while working in
// dev. Getting this wrong is invisible until it is live, hence the coverage.
describe("parseTmdbRequest", () => {
  it("reads a real path, as the dev middleware supplies it", () => {
    expect(parseTmdbRequest("/movie/550?page=2")).toEqual({
      path: "movie/550",
      search: "page=2"
    });
  });

  it("reads the path from the query, as the production rewrite supplies it", () => {
    expect(parseTmdbRequest("/api/tmdb?path=movie/550&page=2")).toEqual({
      path: "movie/550",
      search: "page=2"
    });
  });

  it("handles a full absolute URL, which the edge runtime passes", () => {
    expect(parseTmdbRequest("https://example.com/api/tmdb/movie/550/credits")).toEqual({
      path: "movie/550/credits",
      search: ""
    });
  });

  // Forwarding it would land on TMDB as a stray filter on every request.
  it("never forwards the path parameter upstream", () => {
    expect(parseTmdbRequest("/api/tmdb?path=discover/movie&sort_by=popularity").search)
      .toBe("sort_by=popularity");
  });

  it("returns an empty path when there is nothing to proxy", () => {
    expect(parseTmdbRequest("/api/tmdb").path).toBe("");
    expect(parseTmdbRequest("/api/tmdb/").path).toBe("");
  });

  it("strips stray slashes rather than passing them to the allowlist", () => {
    expect(parseTmdbRequest("/api/tmdb?path=/movie/550/").path).toBe("movie/550");
  });
});
