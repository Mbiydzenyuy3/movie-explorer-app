import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { Check, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { joinWaitlist, addWaitlistDetails, trackEvent } from "../services/waitlist";
import { getWatchRegion } from "../lib/region";
import styles from "./EarlyAccessPage.module.css";

const STEPS = [
  {
    n: "1",
    title: "Say what you're after",
    body: "A mood, and how much time you have. Nothing more to fill in."
  },
  {
    n: "2",
    title: "Get one good suggestion",
    body: "Films that fit the time you've actually got, including African cinema the big apps bury."
  },
  {
    n: "3",
    title: "See where it's streaming",
    body: "In your country, on the services that legally have it. No more opening four apps to check."
  }
];

// Mirrors what the real "Where to watch" panel shows, so people can see the
// point of the product before deciding whether to hand over an email.
const SAMPLE = {
  title: "King of Boys",
  year: "2018",
  region: "Nigeria",
  providers: ["Netflix", "IROKOTV"]
};

export default function EarlyAccessPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState(null);
  const [answered, setAnswered] = useState(false);

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

  const handleAnswer = async (usageIntent) => {
    setAnswered(true);
    await addWaitlistDetails(email, { region: getWatchRegion(), usageIntent });
  };

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <span className={styles.wordmark}>VibeBox</span>
        <Link to="/" className={styles.topLink} onClick={() => trackEvent("explore_click")}>
          Open the app
          <ExternalLink size={14} />
        </Link>
      </header>

      <main className={styles.main}>
        {/* ---------------------------------------------------------- hero */}
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Free while we build it</p>

          <h1 className={styles.headline}>Where can you actually watch it?</h1>

          <p className={styles.subhead}>
            You find a film worth watching, then spend ten minutes working out which
            service has it in your country. VibeBox answers that in one search, with
            proper coverage of Nollywood and African cinema.
          </p>

          {/* Show the result before asking for anything. */}
          <div className={styles.sample} aria-label="Example of a result">
            <div className={styles.sampleHead}>
              <div>
                <p className={styles.sampleTitle}>{SAMPLE.title}</p>
                <p className={styles.sampleMeta}>{SAMPLE.year}</p>
              </div>
              <span className={styles.sampleRegion}>{SAMPLE.region}</span>
            </div>
            <p className={styles.sampleLabel}>Streaming on</p>
            <div className={styles.sampleProviders}>
              {SAMPLE.providers.map((name) => (
                <span key={name} className={styles.sampleChip}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- signup */}
        <section className={styles.signup} aria-labelledby="signup-heading">
          <h2 id="signup-heading" className={styles.signupHeading}>
            Get it when it launches
          </h2>

          <AnimatePresence mode="wait" initial={false}>
            {status !== "done" ? (
              <motion.form
                key="form"
                className={styles.form}
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="email" className={styles.label}>
                  Your email
                </label>

                <div className={styles.inputRow}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    aria-describedby={error ? "email-error" : "email-hint"}
                    aria-invalid={status === "error" || undefined}
                  />
                  <button type="submit" className={styles.submit} disabled={status === "sending"}>
                    {status === "sending" ? (
                      <>
                        <Loader2 size={16} className={styles.spinner} aria-hidden="true" />
                        Joining
                      </>
                    ) : (
                      <>
                        Join the list
                        <ArrowRight size={16} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>

                <p id="email-hint" className={styles.hint}>
                  One email when it launches. No newsletter, no sharing your address.
                </p>

                {error && (
                  <p id="email-error" className={styles.error} role="alert">
                    {error}
                  </p>
                )}
              </motion.form>
            ) : (
              <motion.div
                key="done"
                className={styles.done}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <p className={styles.doneHeading}>
                  <Check size={18} aria-hidden="true" />
                  You&apos;re on the list
                </p>
                <p className={styles.doneBody}>
                  We&apos;ll email {email} once it launches. Nothing before then.
                </p>

                {!answered ? (
                  <div className={styles.question}>
                    <p className={styles.questionText}>
                      One quick question: would you use this every week?
                    </p>
                    <div className={styles.answers}>
                      {[
                        ["yes", "Yes"],
                        ["maybe", "Maybe"],
                        ["no", "Probably not"]
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className={styles.answer}
                          onClick={() => handleAnswer(value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={styles.thanks} role="status">
                    Thank you. That genuinely helps.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* --------------------------------------------------------- steps */}
        <section className={styles.steps} aria-labelledby="how-heading">
          <h2 id="how-heading" className={styles.sectionHeading}>
            How it works
          </h2>
          <ol className={styles.stepList}>
            {STEPS.map(({ n, title, body }) => (
              <li key={n} className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">
                  {n}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepBody}>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ----------------------------------------------------- try it now */}
        <section className={styles.tryIt}>
          <div>
            <h2 className={styles.tryItHeading}>It already works. Go and look.</h2>
            <p className={styles.tryItBody}>
              An early version is live right now. No account needed, nothing to install.
            </p>
          </div>
          <Link
            to="/"
            className={styles.tryItBtn}
            onClick={() => trackEvent("explore_click")}
          >
            Open the app
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          <strong>We don&apos;t stream films.</strong> VibeBox tells you which legal
          service has a title in your country, then sends you there.
        </p>
        <p className={styles.footerFine}>
          Availability data by JustWatch. Film information from TMDB.
        </p>
      </footer>
    </div>
  );
}
