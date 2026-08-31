// Shared between the Vercel edge proxy (api/tmdb.js) and the Vite dev
// middleware (vite.config.js) so the allowlist can never drift between them.

export const TMDB_BASE = "https://api.themoviedb.org/3";

// Without an allowlist the proxy is an open relay to any TMDB route, including
// account/list routes that mutate state.
const ALLOWED = [
  /^movie\/[^/]+$/,
  /^movie\/[^/]+\/(credits|videos|similar|recommendations|images)$/,
  /^movie\/[^/]+\/watch\/providers$/,
  /^tv\/[^/]+$/,
  /^tv\/[^/]+\/(credits|videos|similar|recommendations|images)$/,
  /^tv\/[^/]+\/watch\/providers$/,
  /^tv\/[^/]+\/season\/\d+$/,
  /^discover\/(movie|tv)$/,
  /^search\/(movie|tv|multi|person)$/,
  /^trending\/[^/]+\/[^/]+$/,
  /^genre\/(movie|tv)\/list$/,
  /^person\/[^/]+$/,
  /^watch\/providers\/(regions|movie|tv)$/
];

export const isAllowedTmdbPath = (path) => ALLOWED.some((re) => re.test(path));

/**
 * Pull the TMDB path, and the params worth forwarding, out of a request URL.
 *
 * Two shapes arrive, and both have to work:
 *
 *   /api/tmdb/movie/550?page=2        the dev middleware, which sees the real path
 *   /api/tmdb?path=movie/550&page=2   production, after the vercel.json rewrite
 *
 * The rewrite exists because a bracketed filename (api/tmdb/[...path].js) is a
 * dynamic route, and Vercel resolves those AFTER the rewrites in vercel.json.
 * The SPA fallback therefore won every race and the function never ran. A plain
 * api/tmdb.js is resolved in the filesystem phase instead, which nothing can
 * outrun.
 */
export const parseTmdbRequest = (rawUrl) => {
  const [rawPath, rawSearch = ""] = String(rawUrl).split("?");
  const params = new URLSearchParams(rawSearch);

  // Carried by the rewrite, not meant for TMDB: forwarding it would show up as
  // a stray filter on every upstream request.
  const fromQuery = params.get("path");
  params.delete("path");

  const fromPath = rawPath.replace(/^.*\/api\/tmdb\/?/, "");

  return {
    path: (fromQuery || fromPath || "").replace(/^\/+|\/+$/g, ""),
    search: params.toString()
  };
};

/**
 * Build the upstream TMDB URL, forcing our own api_key so a caller cannot
 * override it with one of their own.
 */
export const buildTmdbUrl = (path, search, apiKey) => {
  const params = new URLSearchParams(search);
  params.delete("api_key");
  params.set("api_key", apiKey);
  return `${TMDB_BASE}/${path}?${params}`;
};

/**
 * Fetch from TMDB with an explicit timeout and one retry.
 *
 * Node/edge `fetch` surfaces a slow or dropped upstream as an opaque
 * "fetch failed", which reaches the client as a bare 502 with nothing
 * actionable in it. An explicit budget turns that into a 504 we can reason
 * about, and one retry absorbs the single transient failure that otherwise
 * blanks a whole row of the UI.
 *
 * @returns {Promise<{ok: true, response: Response} | {ok: false, timedOut: boolean, detail: string}>}
 */
export const fetchTmdb = async (
  url,
  { timeoutMs = 10000, retries = 2, backoffMs = 300 } = {}
) => {
  let lastDetail = "unknown error";
  let lastTimedOut = false;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    // Retrying instantly just hits the same blip: a transient failure was
    // observed to fail twice back-to-back inside 2.5s. A short, growing pause
    // lets the connection recover, which matters most on the slow mobile
    // links described in USER_PERSONAS.md.
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
    }

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs)
      });
      return { ok: true, response };
    } catch (err) {
      lastTimedOut = err.name === "TimeoutError" || err.name === "AbortError";
      lastDetail = lastTimedOut ? `upstream did not respond within ${timeoutMs}ms` : err.message;
    }
  }

  return { ok: false, timedOut: lastTimedOut, detail: lastDetail };
};
