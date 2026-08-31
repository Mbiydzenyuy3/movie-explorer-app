// Vercel Edge Function — the only place the TMDB API key exists.
//
// The browser calls /api/tmdb/movie/popular?page=2 exactly as before; a rewrite
// in vercel.json turns that into /api/tmdb?path=movie/popular&page=2 so this
// file can live at a plain, non-dynamic path.
//
// That matters: this used to be api/tmdb/[...path].js, and a bracketed filename
// is a dynamic route, which Vercel resolves AFTER the rewrites in vercel.json.
// The SPA fallback matched first every time, so the function was built and
// deployed but never reached — /api/tmdb/movie/popular answered 404 in
// production while working fine in dev.
//
// The key is read from TMDB_API_KEY. It deliberately has no VITE_ prefix: Vite
// inlines every VITE_* var into the browser bundle, which is exactly the
// exposure this proxy exists to prevent.

import {
  isAllowedTmdbPath,
  buildTmdbUrl,
  fetchTmdb,
  parseTmdbRequest
} from "../shared/tmdb-paths.js";

export const config = { runtime: "edge" };

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

export default async function handler(req) {
  const { path, search } = parseTmdbRequest(req.url);

  if (!path) return json({ error: "Missing TMDB path" }, 400);
  if (!isAllowedTmdbPath(path)) return json({ error: "Path not allowed" }, 403);

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return json({ error: "Server is missing TMDB_API_KEY" }, 500);

  const result = await fetchTmdb(buildTmdbUrl(path, search, apiKey));

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
