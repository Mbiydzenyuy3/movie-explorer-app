import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import waitlistSource from "../services/waitlist?raw";

import {
  joinWaitlist,
  addWaitlistDetails,
  trackEvent,
  getSource
} from "../services/waitlist";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const okResponse = (status = 201) => ({ ok: true, status, json: async () => ({}) });
const failResponse = (status, body = {}) => ({ ok: false, status, json: async () => body });

// Arguments of the nth fetch call, decoded.
const call = (n = 0) => {
  const [url, init] = mockFetch.mock.calls[n];
  return { url, init, body: JSON.parse(init.body) };
};

const setUrl = (search) => {
  Object.defineProperty(window, "location", {
    value: { search },
    writable: true
  });
};

// The whole reason this module talks to PostgREST directly is page weight:
// supabase-js is 51 kB gzipped on a landing page that makes three requests.
// A stray import would undo it silently, so it is asserted rather than
// left to a future bundle check.
describe("bundle weight", () => {
  it("does not pull in supabase-js", () => {
    expect(waitlistSource).not.toMatch(/from\s+["'].*supabaseClient/);
    expect(waitlistSource).not.toMatch(/@supabase\/supabase-js/);
  });
});

describe("joinWaitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(okResponse());
    setUrl("");
    localStorage.clear();
  });

  afterEach(() => vi.restoreAllMocks());

  it("accepts a valid address and normalises it", async () => {
    const result = await joinWaitlist("  Sarah@Example.COM  ");

    expect(result.ok).toBe(true);
    expect(call(0).url).toContain("/rest/v1/waitlist");
    expect(call(0).body.email).toBe("sarah@example.com");
  });

  it.each([
    "not-an-email",
    "missing@domain",
    "@example.com",
    "spaces in@example.com",
    ""
  ])("rejects %s without hitting the network", async (bad) => {
    const result = await joinWaitlist(bad);

    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Someone re-submitting is not an error from their point of view.
  it("treats a duplicate signup as success", async () => {
    mockFetch.mockResolvedValue(failResponse(409, { code: "23505" }));

    const result = await joinWaitlist("sarah@example.com");

    expect(result).toEqual({ ok: true, duplicate: true });
  });

  it("surfaces a real failure without leaking internals", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValue(failResponse(403, { code: "42501", message: "RLS denied" }));

    const result = await joinWaitlist("sarah@example.com");

    expect(result.ok).toBe(false);
    expect(result.error).not.toContain("RLS");
  });

  // A rejected fetch (offline, DNS, CORS) must read as a failure, not a
  // success, or someone would be told they are on a list they are not on.
  it("reports a network failure rather than claiming success", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockRejectedValue(new Error("network down"));

    const result = await joinWaitlist("sarah@example.com");

    expect(result.ok).toBe(false);
  });

  // The write must never request the row back: RLS grants INSERT but not
  // SELECT, so return=minimal is what keeps the list unreadable.
  it("never asks for the inserted row back", async () => {
    await joinWaitlist("sarah@example.com");

    expect(call(0).init.headers.Prefer).toBe("return=minimal");
  });

  it("records a signup event after a successful join", async () => {
    await joinWaitlist("sarah@example.com");

    expect(call(1).url).toContain("/rest/v1/landing_events");
    expect(call(1).body.event).toBe("signup");
  });
});

// The prefix is what makes a variable visible to the browser build. Removing
// it to "keep the key secret" leaves the value undefined at runtime, and an
// undefined base URL makes every request relative to our own domain.
describe("a deploy missing VITE_SUPABASE_URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("reports failure rather than telling someone they joined", async () => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.resetModules();
    vi.stubEnv("VITE_SUPABASE_URL", "");

    const { joinWaitlist: join } = await import("../services/waitlist");
    const result = await join("sarah@example.com");

    expect(result.ok).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("getSource", () => {
  beforeEach(() => setUrl(""));

  it("defaults to direct", () => {
    expect(getSource()).toBe("direct");
  });

  it("reads utm_source", () => {
    setUrl("?utm_source=whatsapp");
    expect(getSource()).toBe("whatsapp");
  });

  it("caps absurdly long values", () => {
    setUrl(`?utm_source=${"x".repeat(200)}`);
    expect(getSource().length).toBe(40);
  });
});

describe("trackEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(okResponse());
    setUrl("?utm_source=x-twitter");
    localStorage.clear();
  });

  it("records the event with its source", async () => {
    await trackEvent("view");

    expect(call(0).body).toMatchObject({ event: "view", source: "x-twitter" });
  });

  // Analytics failing must never take the page down with it.
  it("swallows failures", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(trackEvent("view")).resolves.toBeUndefined();
  });
});

describe("addWaitlistDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(okResponse(204));
  });

  it("attaches answers to the matching row", async () => {
    const result = await addWaitlistDetails("Sarah@Example.com", {
      region: "NG",
      usageIntent: "yes"
    });

    expect(result.ok).toBe(true);
    expect(call(0).init.method).toBe("PATCH");
    // The address is URL-encoded, so a + in an address filters correctly
    // rather than being read as a space.
    expect(call(0).url).toContain("waitlist?email=eq.sarah%40example.com");
    expect(call(0).body).toEqual({ region: "NG", usage_intent: "yes" });
  });

  it("reports failure when the database rejects the update", async () => {
    // This is the PGRST204 case: it failed while the page still thanked the
    // visitor, which would have read later as weak demand rather than a bug.
    mockFetch.mockResolvedValue(
      failResponse(400, { code: "PGRST204", message: "column does not exist" })
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await addWaitlistDetails("sarah@example.com", {
      region: "NG",
      usageIntent: "yes"
    });

    expect(result.ok).toBe(false);
  });
});
