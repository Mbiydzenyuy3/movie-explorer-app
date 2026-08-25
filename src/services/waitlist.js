import { supabase } from "./supabaseClient";

// The waitlist tables are insert-only for anonymous visitors: RLS grants INSERT
// but no SELECT, so the email list cannot be read off the public API. Every
// write therefore uses returning:'minimal' — asking for the row back would be
// a read, and would fail.
const MINIMAL = { returning: "minimal" };

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
 * thing that tells them apart afterwards.
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
 * Records a landing-page event. Fire-and-forget: analytics must never block or
 * break the page, so failures are swallowed after logging.
 */
export const trackEvent = async (event) => {
  try {
    await supabase
      .from("landing_events")
      .insert({ event, source: getSource(), session_id: getSessionId() }, MINIMAL);
  } catch (err) {
    console.error("Landing analytics failed:", err);
  }
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

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: trimmed, source: getSource() }, MINIMAL);

  if (error) {
    // 23505 = unique violation: already signed up. Not a failure from the
    // visitor's point of view, so it is reported as success.
    if (error.code === "23505") return { ok: true, duplicate: true };
    console.error("Waitlist signup failed:", error);
    return { ok: false, error: "Couldn't save that just now. Try again in a moment." };
  }

  trackEvent("signup");
  return { ok: true };
};

/**
 * Attaches the optional follow-up answers to an existing row.
 * Best-effort: these are a bonus signal, never a blocker.
 */
export const addWaitlistDetails = async (email, { region, wouldPay }) => {
  try {
    await supabase
      .from("waitlist")
      .update({ region, would_pay: wouldPay }, MINIMAL)
      .eq("email", email.trim().toLowerCase());
    return { ok: true };
  } catch (err) {
    console.error("Waitlist detail update failed:", err);
    return { ok: false };
  }
};

export default { joinWaitlist, addWaitlistDetails, trackEvent, getSource, getSessionId };
