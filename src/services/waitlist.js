// Waitlist and landing analytics for the demand test.
//
// This module deliberately does NOT use supabase-js. The client is 51 kB
// gzipped, and this page makes three requests against PostgREST: two inserts
// and one update. /early-access is the cold-traffic landing page the demand
// test depends on, aimed at mobile users in markets where data is expensive,
// and anyone who leaves during the download is invisible to the test — they
// are counted as neither a visitor nor a signup. Fifty kilobytes for three
// HTTP calls is the wrong trade here.
//
// See docs/decisions/0002-demand-test-thresholds.md.

const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Guard against a deploy that is missing VITE_SUPABASE_URL, which is easier to
// do than it sounds: dropping the VITE_ prefix to "keep the key secret" hides
// the value from the client build entirely.
//
// Without this check the failure is not loud. An empty SUPABASE_URL makes the
// fetch below relative — /rest/v1/waitlist — so it resolves against our own
// domain instead of Supabase, where vercel.json rewrites unmatched paths to
// index.html. Depending on how the host answers a POST there, res.ok can be
// true: the visitor is told they are on the list and nothing was written. That
// would read at the end of the window as a page nobody signed up through.
const IS_CONFIGURED = /^https?:\/\//.test(SUPABASE_URL) && Boolean(ANON_KEY);

const SESSION_KEY = "vibebox.landingSession";

/**
 * Stable-ish per-browser id so repeat views from one person can be collapsed
 * when reading the results. Not an identifier for a person, and not used for
 * anything beyond deduplicating view counts.
 */
export const getSessionId = () => {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Private browsing: fall back to a per-page-load id.
    return crypto.randomUUID();
  }
};

/**
 * utm_source from the URL, falling back to "direct".
 *
 * This matters more than it looks: signups from the founder's own network are
 * much weaker evidence than signups from cold traffic, and this is the only
 * thing that tells them apart afterwards. Links shared into a known audience
 * carry a "-warm" suffix and are excluded from the gate.
 */
export const getSource = () => {
  try {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    return utm ? utm.slice(0, 40) : "direct";
  } catch {
    return "direct";
  }
};

/**
 * One PostgREST request.
 *
 * Never throws — a caller decides what a failure means, and analytics failing
 * must not take the page down. Resolves to { ok: true }, or { ok: false } with
 * the Postgres SQLSTATE in `code` when the server supplied one.
 */
const request = async (method, path, body) => {
  if (!IS_CONFIGURED) {
    return {
      ok: false,
      code: "config",
      message: "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing from this build"
    };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
        // RLS grants anonymous visitors INSERT but not SELECT, so asking for
        // the row back would fail. It also keeps the email list off the wire.
        Prefer: "return=minimal"
      },
      body: JSON.stringify(body)
    });

    if (res.ok) return { ok: true };

    // PostgREST reports failures as a JSON body carrying the SQLSTATE.
    // A 204 or an empty body leaves nothing to parse, hence the catch.
    const detail = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, code: detail.code, message: detail.message };
  } catch (err) {
    return { ok: false, code: "network", message: String(err) };
  }
};

/**
 * Records a landing-page event. Fire-and-forget: analytics must never block or
 * break the page, so failures are swallowed after logging.
 */
export const trackEvent = async (event) => {
  const result = await request("POST", "landing_events", {
    event,
    source: getSource(),
    session_id: getSessionId()
  });

  if (!result.ok) console.error("Landing analytics failed:", result);
};

/**
 * Adds an email to the waitlist.
 * @returns {Promise<{ok: boolean, duplicate?: boolean, error?: string}>}
 */
export const joinWaitlist = async (email) => {
  const trimmed = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return { ok: false, error: "That doesn't look like an email address." };
  }

  const result = await request("POST", "waitlist", { email: trimmed, source: getSource() });

  if (!result.ok) {
    // 23505 = unique violation: already signed up. Not a failure from the
    // visitor's point of view, so it is reported as success.
    if (result.code === "23505") return { ok: true, duplicate: true };
    console.error("Waitlist signup failed:", result);
    return { ok: false, error: "Couldn't save that just now. Try again in a moment." };
  }

  trackEvent("signup");
  return { ok: true };
};

/**
 * Attaches the optional follow-up answers to an existing row.
 * Best-effort: these are a bonus signal, never a blocker.
 *
 * The failure path matters more than it looks. Until the usage_intent rename
 * was applied, this call failed with PGRST204 while the page still thanked the
 * visitor, which would have read later as weak demand rather than as a bug.
 */
export const addWaitlistDetails = async (email, { region, usageIntent }) => {
  const target = encodeURIComponent(email.trim().toLowerCase());

  const result = await request("PATCH", `waitlist?email=eq.${target}`, {
    region,
    usage_intent: usageIntent
  });

  if (!result.ok) {
    console.error("Waitlist detail update failed:", result);
    return { ok: false };
  }

  return { ok: true };
};

export default { joinWaitlist, addWaitlistDetails, trackEvent, getSource, getSessionId };
