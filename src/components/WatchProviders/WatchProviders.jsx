import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { ExternalLink, MapPin, Info } from "lucide-react";
import { getWatchProviders } from "../../services/watchProviders";
import {
  getWatchRegion,
  setWatchRegion,
  PRIORITY_REGIONS,
  regionName
} from "../../lib/region";
import styles from "./WatchProviders.module.css";

const GROUPS = [
  { key: "flatrate", label: "Included with subscription" },
  { key: "rent", label: "Rent" },
  { key: "buy", label: "Buy" }
];

/**
 * "Where can I actually watch this" — legitimate availability for one title,
 * for the viewer's region, sourced from TMDB/JustWatch.
 *
 * Availability is genuinely missing for a large minority of titles, so the
 * empty state is a first-class case here rather than an afterthought.
 */
export default function WatchProviders({ tmdbId, mediaType, title }) {
  const [region, setRegion] = useState(getWatchRegion);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | empty | error

  const load = useCallback(async () => {
    if (!tmdbId) return;
    setStatus("loading");
    try {
      const result = await getWatchProviders(tmdbId, mediaType, region);
      setData(result);
      setStatus(result ? "ready" : "empty");
    } catch {
      setData(null);
      setStatus("error");
    }
  }, [tmdbId, mediaType, region]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRegionChange = (event) => {
    const next = event.target.value;
    setRegion(next);
    setWatchRegion(next);
  };

  const regionPicker = (
    <label className={styles.regionPicker}>
      <MapPin size={13} />
      <span className={styles.srOnly}>Watch region</span>
      <select value={region} onChange={handleRegionChange} className={styles.regionSelect}>
        {PRIORITY_REGIONS.map((r) => (
          <option key={r.code} value={r.code}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section className={styles.container} aria-live="polite">
      <header className={styles.header}>
        <h3 className={styles.heading}>Where to watch</h3>
        {regionPicker}
      </header>

      {status === "loading" && (
        <p className={styles.muted}>Checking availability in {regionName(region)}…</p>
      )}

      {status === "error" && (
        <div className={styles.notice}>
          <Info size={15} />
          <span>Couldn&apos;t load availability right now.</span>
          <button type="button" onClick={load} className={styles.retry}>
            Retry
          </button>
        </div>
      )}

      {status === "empty" && (
        <div className={styles.notice}>
          <Info size={15} />
          <span>
            No streaming availability listed for {regionName(region)}. The data is patchy
            for some titles, so try another region.
          </span>
        </div>
      )}

      {status === "ready" && data && (
        <>
          {GROUPS.map(({ key, label }) => {
            const list = data[key];
            if (!list?.length) return null;
            return (
              <div key={key} className={styles.group}>
                <p className={styles.groupLabel}>{label}</p>
                <div className={styles.providers}>
                  {list.map((provider, i) => (
                    <motion.a
                      key={provider.id}
                      href={data.link || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.provider}
                      title={`Watch "${title}" on ${provider.name}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {provider.logo && (
                        <img
                          src={provider.logo}
                          alt=""
                          className={styles.logo}
                          loading="lazy"
                          width={28}
                          height={28}
                        />
                      )}
                      <span className={styles.providerName}>{provider.name}</span>
                      <ExternalLink size={12} className={styles.externalIcon} />
                    </motion.a>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Required by TMDB's terms for this endpoint. */}
      <p className={styles.attribution}>Availability data by JustWatch</p>
    </section>
  );
}

WatchProviders.propTypes = {
  tmdbId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  mediaType: PropTypes.oneOf(["movie", "tv"]),
  title: PropTypes.string
};

WatchProviders.defaultProps = {
  mediaType: "movie",
  title: ""
};
