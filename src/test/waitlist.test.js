import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock("../services/supabaseClient", () => ({
  supabase: {
    from: () => ({
      insert: mockInsert,
      update: (...args) => {
        mockUpdate(...args);
        return { eq: mockEq };
      }
    })
  }
}));

const { joinWaitlist, addWaitlistDetails, trackEvent, getSource } = await import(
  "../services/waitlist"
);

const setUrl = (search) => {
  Object.defineProperty(window, "location", {
    value: { search },
    writable: true
  });
};

describe("joinWaitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    setUrl("");
    localStorage.clear();
  });

  afterEach(() => vi.restoreAllMocks());

  it("accepts a valid address and normalises it", async () => {
    const result = await joinWaitlist("  Sarah@Example.COM  ");

    expect(result.ok).toBe(true);
    expect(mockInsert.mock.calls[0][0].email).toBe("sarah@example.com");
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
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // Someone re-submitting is not an error from their point of view.
  it("treats a duplicate signup as success", async () => {
    mockInsert.mockResolvedValue({ error: { code: "23505" } });

    const result = await joinWaitlist("sarah@example.com");

    expect(result).toEqual({ ok: true, duplicate: true });
  });

  it("surfaces a real failure without leaking internals", async () => {
    mockInsert.mockResolvedValue({ error: { code: "42501", message: "RLS denied" } });

    const result = await joinWaitlist("sarah@example.com");

    expect(result.ok).toBe(false);
    expect(result.error).not.toContain("RLS");
  });

  // The write must never request the row back: RLS grants INSERT but not
  // SELECT, so returning:'minimal' is what keeps the list unreadable.
  it("never asks for the inserted row back", async () => {
    await joinWaitlist("sarah@example.com");

    expect(mockInsert.mock.calls[0][1]).toEqual({ returning: "minimal" });
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
    mockInsert.mockResolvedValue({ error: null });
    setUrl("?utm_source=x-twitter");
    localStorage.clear();
  });

  it("records the event with its source", async () => {
    await trackEvent("view");

    expect(mockInsert.mock.calls[0][0]).toMatchObject({
      event: "view",
      source: "x-twitter"
    });
  });

  // Analytics failing must never take the page down with it.
  it("swallows failures", async () => {
    mockInsert.mockRejectedValue(new Error("network down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(trackEvent("view")).resolves.toBeUndefined();
  });
});

describe("addWaitlistDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockResolvedValue({ error: null });
  });

  it("attaches answers to the matching row", async () => {
    await addWaitlistDetails("Sarah@Example.com", { region: "NG", wouldPay: "yes" });

    expect(mockUpdate).toHaveBeenCalledWith(
      { region: "NG", would_pay: "yes" },
      { returning: "minimal" }
    );
    expect(mockEq).toHaveBeenCalledWith("email", "sarah@example.com");
  });
});
