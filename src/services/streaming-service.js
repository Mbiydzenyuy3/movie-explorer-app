// Streaming Service - Multi-Source Engine for Ad-Free HLS Playback
const CONSUMET_API_BASE = "https://api.consumet.org";

/**
 * Get streaming links with multi-source fallback
 */
export const getMovieStreamingLinks = async (tmdbId, type = "movie") => {
  // We'll try multiple sub-providers within Consumet or other aggregators
  const providers = ["flixhq", "view-source", "remote-stream"];
  
  for (const provider of providers) {
    try {
      const response = await fetch(
        `${CONSUMET_API_BASE}/meta/tmdb/info/${tmdbId}?type=${type}`
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data && data.episodeId) {
          // For meta/tmdb, we usually get an episodeId/id then fetch sources
          const sourceRes = await fetch(`${CONSUMET_API_BASE}/meta/tmdb/watch/${data.episodeId}?id=${tmdbId}`);
          if (sourceRes.ok) {
              const sourceData = await sourceRes.json();
              if (sourceData && sourceData.sources) return sourceData;
          }
      }

      // Fallback to direct movies/tv route
      const directRes = await fetch(`${CONSUMET_API_BASE}/${type === "tv" ? "tv" : "movies"}/${tmdbId}`);
      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData && (directData.sources || directData.results)) return directData;
      }
    } catch (error) {
      console.error(`Error with provider ${provider}:`, error);
    }
  }
  return null;
};

/**
 * TV Episode streaming
 */
export const getEpisodeStreamingLinks = async (tmdbId, season, episode) => {
  try {
    // Attempt meta/tmdb route first (most reliable for HLS)
    const infoRes = await fetch(`${CONSUMET_API_BASE}/meta/tmdb/info/${tmdbId}?type=tv`);
    if (infoRes.ok) {
        const info = await infoRes.json();
        const targetEpisode = info.episodes?.find(e => e.season === season && e.number === episode);
        if (targetEpisode) {
            const sourceRes = await fetch(`${CONSUMET_API_BASE}/meta/tmdb/watch/${targetEpisode.id}?id=${tmdbId}`);
            if (sourceRes.ok) return await sourceRes.json();
        }
    }

    // Fallback to standard tv route
    const response = await fetch(`${CONSUMET_API_BASE}/tv/${tmdbId}/${season}/${episode}`);
    if (response.ok) return await response.json();
  } catch (error) {
    console.error("Error fetching episode streaming links:", error);
  }
  return null;
};

/**
 * Extract the best M3U8 URL from diverse streaming sources
 */
export const extractBestStreamUrl = (data) => {
  if (!data) return null;

  // Case 1: sources directly in object (meta/tmdb route)
  if (data.sources && Array.isArray(data.sources)) {
    // Prefer non-backup, high quality
    const hls = data.sources.find(s => s.quality === "auto" || s.isM3U8) || data.sources[0];
    return hls?.url || null;
  }

  // Case 2: results array (movies/tv route)
  if (data.results && Array.isArray(data.results)) {
     const priority = ["vidplay", "upcloud", "vidcloud"];
     for (const p of priority) {
         const s = data.results.find(res => res.name?.toLowerCase().includes(p) || res.provider?.toLowerCase().includes(p));
         if (s?.url) return s.url;
     }
     return data.results[0]?.url || null;
  }

  return null;
};

/**
 * High-level movie stream getter
 */
export const getMovieStream = async (tmdbId) => {
  const data = await getMovieStreamingLinks(tmdbId, "movie");
  const url = extractBestStreamUrl(data);
  
  return url ? {
    url,
    provider: data.providerId || "Multi-Source"
  } : null;
};

/**
 * High-level episode stream getter
 */
export const getEpisodeStream = async (tmdbId, season, episode) => {
  const data = await getEpisodeStreamingLinks(tmdbId, season, episode);
  const url = extractBestStreamUrl(data);
  
  return url ? {
    url,
    provider: data.providerId || "Multi-Source"
  } : null;
};

export default {
  getMovieStream,
  getEpisodeStream,
  getMovieStreamingLinks,
  getEpisodeStreamingLinks
};
