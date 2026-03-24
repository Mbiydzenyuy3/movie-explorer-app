import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import styles from "./AdBanner.module.css";

const ADS = [
  {
    id: 1,
    label: "SPONSORED",
    headline: "Upgrade to VibeBox Pro",
    subline: "4K streaming · Offline downloads · No ads",
    cta: "Try Free for 7 Days →",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    action: "internal",
    href: "/upgrade"
  },
  {
    id: 2,
    label: "PARTNER",
    headline: "Stream Nollywood's Best on African Magic",
    subline: "New releases every Friday — free for 30 days",
    cta: "Start Watching →",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    action: "external",
    href: "https://www.africanmagic.com"
  }
];

export default function AdBanner({ isPro = false, className = "" }) {
  const navigate = useNavigate();
  const [adIndex, setAdIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const handleCtaClick = (ad) => {
    if (ad.action === "external") {
      window.open(ad.href, "_blank", "noopener,noreferrer");
    } else {
      navigate(ad.href);
    }
  };

  // Rotate ads every 12 seconds
  useEffect(() => {
    if (isPro || dismissed) return;
    const t = setInterval(
      () => setAdIndex((i) => (i + 1) % ADS.length),
      12000
    );
    return () => clearInterval(t);
  }, [isPro, dismissed]);

  if (isPro || dismissed) return null;

  const ad = ADS[adIndex];

  return (
    <AnimatePresence>
      <motion.div
        key={ad.id}
        className={`${styles.banner} ${className}`}
        style={{ background: ad.gradient }}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        layout
      >
        <div className={styles.inner}>
          <div className={styles.labelRow}>
            <Zap size={12} />
            <span>{ad.label}</span>
          </div>
          <p className={styles.headline}>{ad.headline}</p>
          <p className={styles.subline}>{ad.subline}</p>
          <button
            type="button"
            className={styles.cta}
            onClick={() => handleCtaClick(ad)}
          >
            {ad.cta}
          </button>
        </div>

        <motion.button
          className={styles.dismiss}
          onClick={() => setDismissed(true)}
          aria-label="Dismiss ad"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={16} />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

AdBanner.propTypes = {
  isPro: PropTypes.bool,
  className: PropTypes.string
};
