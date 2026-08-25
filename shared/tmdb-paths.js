// Shared between the Vercel edge proxy (api/tmdb/[...path].js) and the Vite dev
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
export const fetchTmdb = async (url, { timeoutMs = 8000, retries = 1 } = {}) => {
  let lastDetail = "unknown error";
  let lastTimedOut = false;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
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
