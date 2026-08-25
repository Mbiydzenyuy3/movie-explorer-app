import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag } from "lucide-react";
import styles from "./AffiliateLink.module.css";

const providers = [
  { name: "Amazon Prime", url: "https://www.amazon.com/s?k=", icon: "📦", color: "#FF9900", dark: true },
  { name: "Netflix", url: "https://www.netflix.com/search?q=", icon: "🎬", color: "#E50914", dark: true },
  { name: "Apple TV+", url: "https://tv.apple.com/search?term=", icon: "🍎", color: "#555555", dark: true },
];

export default function AffiliateLink({ movieTitle, className = "" }) {
  if (!movieTitle) return null;

  const handleClick = (provider) => {
    const url = `${provider.url}${encodeURIComponent(movieTitle)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <p className={styles.label}>
        <ShoppingBag size={14} />
        <span>Also available on</span>
      </p>
      <div className={styles.providers}>
        {providers.map((provider, i) => (
          <motion.button
            key={provider.name}
            className={styles.providerBtn}
            style={{ "--provider-color": provider.color }}
            onClick={() => handleClick(provider)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            title={`Watch "${movieTitle}" on ${provider.name}`}
          >
            <span className={styles.providerIcon}>{provider.icon}</span>
            <span className={styles.providerName}>{provider.name}</span>
            <ExternalLink size={12} className={styles.externalIcon} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

AffiliateLink.propTypes = {
  movieTitle: PropTypes.string,
  className: PropTypes.string,
};
