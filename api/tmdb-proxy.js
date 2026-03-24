// api/tmdb-proxy.js
// Vercel Edge Function - proxies TMDB API calls, keeping the API key server-side

export const config = { runtime: "edge" };

export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return new Response(JSON.stringify({ error: "Missing ?path= parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = process.env.VITE_API_KEY;
  const baseUrl = process.env.VITE_BASE_BASE_URL || "https://api.themoviedb.org/3";

  // Forward all other query params except 'path'
  const forwardParams = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (key !== "path") forwardParams.set(key, value);
  });
  forwardParams.set("api_key", apiKey);

  const tmdbUrl = `${baseUrl}${path}?${forwardParams.toString()}`;

  try {
    const response = await fetch(tmdbUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "VibeBox/1.0"
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upstream request failed", detail: err.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
