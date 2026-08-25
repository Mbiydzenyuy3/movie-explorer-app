// Watch-provider region handling.
// TMDB availability data is region-specific, so every provider lookup needs a country code.

const STORAGE_KEY = "vibebox.watchRegion";
const FALLBACK = "US";

// Regions we surface first in the picker — the markets in USER_PERSONAS.md.
export const PRIORITY_REGIONS = [
  { code: "NG", name: "Nigeria" },
  { code: "CM", name: "Cameroon" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" }
];

/**
 * Pull a country code out of a BCP-47 locale ("en-NG" -> "NG").
 */
const countryFromLocale = (locale) => {
  if (!locale) return null;
  const parts = locale.split("-");
  // A bare language tag ("en", "fr") carries no country. Without this guard
  // "en" would be read as country "EN", which is not a country at all.
  if (parts.length < 2) return null;
  const region = parts[parts.length - 1];
  return /^[A-Za-z]{2}$/.test(region) ? region.toUpperCase() : null;
};

/**
 * Best guess at the viewer's region: stored choice, then browser locale, then US.
 * Storage can throw in private-mode browsers, so every access is guarded.
 */
export const getWatchRegion = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && /^[A-Z]{2}$/.test(saved)) return saved;
  } catch {
    // storage unavailable — fall through to locale detection
  }

  if (typeof navigator !== "undefined") {
    const fromLocale =
      countryFromLocale(navigator.language) ||
      countryFromLocale((navigator.languages || [])[0]);
    if (fromLocale) return fromLocale;
  }

  return FALLBACK;
};

export const setWatchRegion = (code) => {
  if (!/^[A-Z]{2}$/.test(code)) return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // non-fatal: the region just won't persist across reloads
  }
};

export const regionName = (code) =>
  PRIORITY_REGIONS.find((r) => r.code === code)?.name || code;
