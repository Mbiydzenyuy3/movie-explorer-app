// Where-to-watch lookups against TMDB's /watch/providers endpoint.
// The data is supplied by JustWatch; TMDB's terms require attributing them
// wherever it is displayed (see WatchProviders.jsx).

// Routed through our proxy so the TMDB key stays server-side.
const BASE_URL = "/api/tmdb";

const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/original";

/**
 * Availability for one title in one region.
 *
 * Returns null when TMDB has no provider data for that region — a common case
 * (roughly 4 in 10 of the Nollywood titles we sampled), so callers must render
 * an explicit empty state rather than assuming a result.
 *
 * @param {number|string} id     TMDB id
 * @param {"movie"|"tv"} type
 * @param {string} region        ISO 3166-1 country code
 * @returns {Promise<{link: string, flatrate: [], rent: [], buy: []}|null>}
 */
export const getWatchProviders = async (id, type = "movie", region = "US") => {
  if (!id) return null;

  const url = `${BASE_URL}/${type}/${id}/watch/providers`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB watch/providers failed: ${response.status}`);
  }

  const data = await response.json();
  const forRegion = data.results?.[region];
  if (!forRegion) return null;

  const normalise = (list) =>
    (list || []).map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: p.logo_path ? `${TMDB_LOGO_BASE}${p.logo_path}` : null
    }));

  const flatrate = normalise(forRegion.flatrate);
  const rent = normalise(forRegion.rent);
  const buy = normalise(forRegion.buy);

  if (!flatrate.length && !rent.length && !buy.length) return null;

  return {
    // JustWatch deep link for this title/region, supplied by TMDB.
    // Used as-is: no affiliate parameters until a programme has approved us.
    link: forRegion.link || null,
    flatrate,
    rent,
    buy
  };
};

/**
 * Region codes TMDB supports for availability data.
 */
export const getSupportedRegions = async () => {
  const response = await fetch(`${BASE_URL}/watch/providers/regions`);
  if (!response.ok) throw new Error(`TMDB regions failed: ${response.status}`);
  const data = await response.json();
  return (data.results || []).map((r) => ({
    code: r.iso_3166_1,
    name: r.english_name
  }));
};

export default { getWatchProviders, getSupportedRegions };
