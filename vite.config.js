import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import {
  isAllowedTmdbPath,
  buildTmdbUrl,
  fetchTmdb,
  parseTmdbRequest,
} from "./shared/tmdb-paths.js";

/**
 * Dev-time stand-in for the Vercel edge function at api/tmdb/[...path].js.
 * Same allowlist, same key handling — so `npm run dev` behaves like production
 * and the key stays server-side in both.
 */
const tmdbProxyDev = (apiKey) => {
  const middleware = async (req, res) => {
    const send = (status, body) => {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(body));
    };

    // Same parser as the edge function, so dev and production cannot disagree
    // about what counts as a path.
    const { path, search } = parseTmdbRequest(req.url);

    if (!path) return send(400, { error: "Missing TMDB path" });
    if (!isAllowedTmdbPath(path))
      return send(403, { error: "Path not allowed" });
    if (!apiKey) return send(500, { error: "Server is missing TMDB_API_KEY" });

    const result = await fetchTmdb(buildTmdbUrl(path, search, apiKey));

    if (!result.ok) {
      return send(result.timedOut ? 504 : 502, {
        error: "Upstream request failed",
        detail: result.detail,
      });
    }

    res.statusCode = result.response.status;
    res.setHeader("Content-Type", "application/json");
    res.end(await result.response.text());
  };

  return {
    name: "tmdb-proxy-dev",
    // Registered for both `vite dev` and `vite preview` so local QA of a
    // production build exercises the same proxy path as deployment.
    // Braces matter: returning middlewares.use()'s value makes Vite treat it
    // as a post-hook and invoke it with no request object.
    configureServer(server) {
      server.middlewares.use("/api/tmdb", middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/tmdb", middleware);
    },
  };
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Empty prefix loads unprefixed vars too. These stay in the Node process and
  // are never handed to the client bundle.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tmdbProxyDev(env.TMDB_API_KEY)],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setupTests.js",
      include: ["src/**/*.{test,spec}.{js,jsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
      },
    },
  };
});
