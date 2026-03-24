// Streaming Service - Uses Consumet API for ad-free M3U8 streaming
// Based on the research: Direct M3U8 extraction bypasses all ads

const CONSUMET_API_BASE = "https://api.consumet.org";

/**
 * Get streaming links for a movie using Consumet API
 * @param {number} tmdbId - TMDB movie ID
 * @param {string} type - 'movie' or 'tv'
 * @returns {Promise<Object>} Streaming sources
 */
export const getMovieStreamingLinks = async (tmdbId, type = "movie") => {
  try {
    const response = await fetch(
      `${CONSUMET_API_BASE}/${type === "tv" ? "tv" : "movies"}/${tmdbId}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching streaming links:", error);
    return null;
  }
};

/**
 * Get streaming links for a TV episode
 * @param {number} tmdbId - TMDB TV show ID
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {Promise<Object>} Streaming sources
 */
export const getEpisodeStreamingLinks = async (tmdbId, season, episode) => {
  try {
    const response = await fetch(
      `${CONSUMET_API_BASE}/tv/${tmdbId}/${season}/${episode}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching episode streaming links:", error);
    return null;
  }
};

/**
 * Extract the best M3U8 URL from streaming sources
 * @param {Object} streamingData - Data from Consumet API
 * @returns {string|null} Best M3U8 URL
 */
export const extractBestStreamUrl = (streamingData) => {
  if (!streamingData || !streamingData.results) {
    return null;
  }

  // Priority order for providers (most reliable first)
  const providerPriority = [
    "vidplay",
    "streamtape", 
    "filemoon",
    "doodstream",
    "voe",
    "upcloud",
    "vidcloud",
    "streambucket"
  ];

  const results = streamingData.results;

  // Find the best provider based on priority
  for (const provider of providerPriority) {
    const source = results.find(
      (s) => s.provider?.toLowerCase().includes(provider) ||
             s.name?.toLowerCase().includes(provider)
    );
    
    if (source?.url) {
      return source.url;
    }
  }

  // If no prioritized provider found, return first available
  if (results.length > 0 && results[0].url) {
    return results[0].url;
  }

  return null;
};

/**
 * Get movie with direct stream URL
 * @param {number} tmdbId - TMDB movie ID
 * @returns {Promise<{url: string, provider: string}|null>}
 */
export const getMovieStream = async (tmdbId) => {
  const streamingData = await getMovieStreamingLinks(tmdbId, "movie");
  
  if (!streamingData) {
    return null;
  }

  const url = extractBestStreamUrl(streamingData);
  
  return url ? {
    url,
    provider: streamingData.results?.[0]?.provider || "Unknown"
  } : null;
};

/**
 * Get episode with direct stream URL
 * @param {number} tmdbId - TMDB TV show ID
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {Promise<{url: string, provider: string}|null>}
 */
export const getEpisodeStream = async (tmdbId, season, episode) => {
  const streamingData = await getEpisodeStreamingLinks(tmdbId, season, episode);
  
  if (!streamingData) {
    return null;
  }

  const url = extractBestStreamUrl(streamingData);
  
  return url ? {
    url,
    provider: streamingData.results?.[0]?.provider || "Unknown"
  } : null;
};

export default {
  getMovieStreamingLinks,
  getEpisodeStreamingLinks,
  getMovieStream,
  getEpisodeStream,
  extractBestStreamUrl
};
