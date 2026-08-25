import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getWatchProviders } from "../services/watchProviders";
import { getWatchRegion, setWatchRegion, regionName } from "../lib/region";

const providerPayload = (results) => ({
  ok: true,
  json: async () => ({ id: 550, results })
});

describe("getWatchProviders", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns normalised providers for the requested region", async () => {
    global.fetch.mockResolvedValue(
      providerPayload({
        NG: {
          link: "https://justwatch.com/ng/movie/x",
          flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/n.jpg" }],
          rent: [{ provider_id: 9, provider_name: "Amazon Prime Video", logo_path: null }]
        }
      })
    );

    const result = await getWatchProviders(550, "movie", "NG");

    expect(result.link).toBe("https://justwatch.com/ng/movie/x");
    expect(result.flatrate).toEqual([
      { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/n.jpg" }
    ]);
    expect(result.rent[0]).toEqual({ id: 9, name: "Amazon Prime Video", logo: null });
    expect(result.buy).toEqual([]);
  });

  // ~4 in 10 sampled Nollywood titles have no data for NG/CM, so this is the
  // common path, not an edge case.
  it("returns null when the region has no entry at all", async () => {
    global.fetch.mockResolvedValue(providerPayload({ US: { flatrate: [] } }));

    expect(await getWatchProviders(550, "movie", "NG")).toBeNull();
  });

  it("returns null when the region exists but lists no providers", async () => {
    global.fetch.mockResolvedValue(
      providerPayload({ NG: { link: "https://justwatch.com/ng", flatrate: [], rent: [], buy: [] } })
    );

    expect(await getWatchProviders(550, "movie", "NG")).toBeNull();
  });

  it("returns null without calling the API when no id is given", async () => {
    expect(await getWatchProviders(null)).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("throws on a failed request so the UI can show a retry", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 });

    await expect(getWatchProviders(550, "movie", "NG")).rejects.toThrow("404");
  });

  it("requests the tv endpoint for series", async () => {
    global.fetch.mockResolvedValue(providerPayload({}));

    await getWatchProviders(1399, "tv", "CM");

    expect(global.fetch.mock.calls[0][0]).toContain("/tv/1399/watch/providers");
  });
});

describe("watch region", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("prefers a previously saved region", () => {
    setWatchRegion("CM");
    expect(getWatchRegion()).toBe("CM");
  });

  it("ignores malformed region codes", () => {
    setWatchRegion("nigeria");
    expect(getWatchRegion()).not.toBe("nigeria");
  });

  it("falls back to the browser locale's country", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("en-NG");
    expect(getWatchRegion()).toBe("NG");
  });

  it("falls back to US when the locale carries no country", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("en");
    vi.spyOn(navigator, "languages", "get").mockReturnValue([]);
    expect(getWatchRegion()).toBe("US");
  });

  it("survives localStorage throwing (private browsing)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(navigator, "language", "get").mockReturnValue("en-GH");

    expect(() => getWatchRegion()).not.toThrow();
    expect(getWatchRegion()).toBe("GH");
  });

  it("names known regions and passes through unknown codes", () => {
    expect(regionName("NG")).toBe("Nigeria");
    expect(regionName("JP")).toBe("JP");
  });
});
