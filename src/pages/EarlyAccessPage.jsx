import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { Search, MapPin, Clock, Check, Loader2, ArrowRight } from "lucide-react";
import { joinWaitlist, addWaitlistDetails, trackEvent } from "../services/waitlist";
import { getWatchRegion } from "../lib/region";
import styles from "./EarlyAccessPage.module.css";

const PROMISES = [
  {
    icon: Search,
    title: "One search, every service",
    body: "Netflix, Prime, IROKOTV, Apple TV — find which one actually has the film, instead of opening four apps to find out."
  },
  {
    icon: MapPin,
    title: "Accurate for where you are",
    body: "Availability is different in Lagos than it is in London. We check your country, not America's."
  },
  {
    icon: Clock,
    title: "Built for the time you've got",
    body: "Tell us your mood and how long you have. We'll pick something that fits, so you watch instead of scroll."
  }
];

export default function EarlyAccessPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState(null);
  const [followUpSent, setFollowUpSent] = useState(false);

  useEffect(() => {
    trackEvent("view");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError(null);

    const result = await joinWaitlist(email);

    if (result.ok) {
      setStatus("done");
    } else {
      setError(result.error);
      setStatus("error");
    }
  };

  const handleFollowUp = async (wouldPay) => {
    setFollowUpSent(true);
    // Region is inferred from the browser rather than asked: it costs the
    // visitor nothing and tells us which markets the interest comes from.
    await addWaitlistDetails(email, { region: getWatchRegion(), wouldPay });
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.wordmark}>VibeBox</span>
        </header>

        <section className={styles.hero}>
          <motion.h1
            className={styles.headline}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Where can you actually watch it?
          </motion.h1>

          <motion.p
            className={styles.subhead}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            Nollywood, African cinema and everything else — find what&apos;s streaming
            in Nigeria, Cameroon, Ghana and Kenya. One search, not four apps.
          </motion.p>

          <AnimatePresence mode="wait">
            {status !== "done" ? (
              <motion.form
                key="form"
                className={styles.form}
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <label htmlFor="email" className={styles.srOnly}>
                  Email address
                </label>
                <div className={styles.inputRow}>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    aria-describedby={error ? "email-error" : undefined}
                    aria-invalid={status === "error"}
                  />
                  <button
                    type="submit"
                    className={styles.submit}
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 size={16} className={styles.spinner} />
                        <span>Joining</span>
                      </>
                    ) : (
                      <>
                        <span>Get early access</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <p id="email-error" className={styles.error} role="alert">
                    {error}
                  </p>
                )}

                <p className={styles.reassure}>
                  One email when it&apos;s ready. Nothing else, ever.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="done"
                className={styles.done}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <p className={styles.doneHeading}>
                  <Check size={18} /> You&apos;re on the list.
                </p>

                {!followUpSent ? (
                  <div className={styles.followUp}>
                    <p className={styles.followUpQ}>
                      One optional question — would you pay for this?
                    </p>
                    <div className={styles.followUpRow}>
                      {[
                        ["yes", "Yes"],
                        ["maybe", "Maybe"],
                        ["no", "No, only if free"]
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className={styles.chip}
                          onClick={() => handleFollowUp(value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={styles.thanks}>Thank you — that genuinely helps.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className={styles.promises}>
          {PROMISES.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              className={styles.promise}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.08 }}
            >
              <Icon size={20} className={styles.promiseIcon} />
              <h2 className={styles.promiseTitle}>{title}</h2>
              <p className={styles.promiseBody}>{body}</p>
            </motion.div>
          ))}
        </section>

        <section className={styles.tryIt}>
          <p className={styles.tryItText}>
            There&apos;s a working version already. Have a look before you decide.
          </p>
          <Link
            to="/"
            className={styles.tryItLink}
            onClick={() => trackEvent("explore_click")}
          >
            Try it now <ArrowRight size={15} />
          </Link>
        </section>

        <footer className={styles.footer}>
          <p>
            We don&apos;t stream anything. We point you to the services that legally
            do. Availability data by JustWatch.
          </p>
        </footer>
      </div>
    </main>
  );
}
