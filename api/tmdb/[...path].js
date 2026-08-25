// Vercel Edge Function — the only place the TMDB API key exists.
//
// Catch-all: /api/tmdb/movie/popular?page=2  ->  api.themoviedb.org/3/movie/popular?page=2
// The key is read from TMDB_API_KEY. It deliberately has no VITE_ prefix:
// Vite inlines every VITE_* var into the browser bundle, which is exactly the
// exposure this proxy exists to prevent.

import { isAllowedTmdbPath, buildTmdbUrl, fetchTmdb } from "../../shared/tmdb-paths.js";

export const config = { runtime: "edge" };

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/tmdb\/?/, "").replace(/^\/+|\/+$/g, "");

  if (!path) return json({ error: "Missing TMDB path" }, 400);
  if (!isAllowedTmdbPath(path)) return json({ error: "Path not allowed" }, 403);

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return json({ error: "Server is missing TMDB_API_KEY" }, 500);

  const result = await fetchTmdb(buildTmdbUrl(path, url.search, apiKey));

  if (!result.ok) {
    return json(
      { error: "Upstream request failed", detail: result.detail },
      result.timedOut ? 504 : 502
    );
  }

  return new Response(await result.response.text(), {
    status: result.response.status,
    headers: {
      "Content-Type": "application/json",
      // TMDB data is public and slow-moving; edge caching keeps us well
      // inside TMDB's rate limits as traffic grows.
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
    }
  });
}
