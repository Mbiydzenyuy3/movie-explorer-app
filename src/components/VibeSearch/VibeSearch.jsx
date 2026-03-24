import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, ArrowRight } from "lucide-react";
import styles from "./VibeSearch.module.css";

const vibeMappings = {
  "dark but hopeful": { mood: "tense", tone: "uplifting", genres: [18, 53] },
  "rainy sunday": { mood: "relaxed", time: "long", genres: [35, 10749] },
  short: { maxDuration: 30, genres: [99, 10770] },
  "quick watch": { maxDuration: 45, genres: [35, 53] },
  "binge worthy": { minEpisodes: 6, genres: [18, 80] },
  "date night": { mood: "romantic", genres: [10749, 35] },
  "girls night": { mood: "energetic", genres: [35, 10749] },
  "guys night": { mood: "energetic", genres: [28, 53] },
  "family movie": { mood: "relaxed", genres: [10751, 16] },
  "solo night": { mood: "dark", genres: [27, 53] },
  action: { genres: [28] },
  comedy: { genres: [35] },
  drama: { genres: [18] },
  horror: { genres: [27] },
  romance: { genres: [10749] },
  thriller: { genres: [53] },
  scifi: { genres: [878] },
  fantasy: { genres: [14] },
  animation: { genres: [16] },
  documentary: { genres: [99] },
  african: { region: "AF", genres: [10769] },
  nigerian: { country: "NG", genres: [10769] },
  nollywood: { country: "NG", genres: [10769] },
  long: { minDuration: 120 },
  epic: { minDuration: 150, genres: [14, 28] },
  "short film": { maxDuration: 20, genres: [99, 10770] },
  "award winning": { cert: "approved", genres: [18, 36] },
  "critically acclaimed": { minRating: 7.5 },
  popular: { sortBy: "popularity.desc" },
  "top rated": { sortBy: "vote_average.desc" }
};

const suggestions = [
  "Something dark but hopeful",
  "Quick watch under 45 mins",
  "Date night romance",
  "Nigerian movies",
  "Award winning drama",
  "Feel good comedy"
];

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } }
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.05, duration: 0.2, ease: "easeOut" }
  })
};

const VibeSearch = ({
  onSearch,
  placeholder = 'Try "dark but hopeful" or "quick watch"'
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [detectedVibe, setDetectedVibe] = useState(null);

  const parseVibeQuery = useCallback((searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchedVibes = [];
    Object.entries(vibeMappings).forEach(([key, config]) => {
      if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
        matchedVibes.push({ key, config });
      }
    });
    if (matchedVibes.length > 0) {
      const bestMatch = matchedVibes.sort((a, b) => b.key.length - a.key.length)[0];
      return bestMatch.config;
    }
    return null;
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setDetectedVibe(parseVibeQuery(value));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.({ query: query.trim(), vibe: detectedVibe });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    const vibe = parseVibeQuery(suggestion);
    setDetectedVibe(vibe);
    onSearch?.({ query: suggestion, vibe });
  };

  const handleClear = () => {
    setQuery("");
    setDetectedVibe(null);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <motion.div
          className={`${styles.searchBox} ${isFocused ? styles.focused : ""}`}
          animate={isFocused ? { boxShadow: "0 0 0 3px rgba(102,126,234,0.25), 0 8px 32px rgba(0,0,0,0.3)" } : { boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}
          transition={{ duration: 0.2 }}
        >
          <Search size={20} className={styles.searchIcon} />

          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className={styles.searchInput}
          />

          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                onClick={handleClear}
                className={styles.clearBtn}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                whileTap={{ scale: 0.85 }}
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className={styles.submitBtn}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </form>

      {/* Detected Vibe Badge */}
      <AnimatePresence>
        {detectedVibe && query && (
          <motion.div
            className={styles.vibeDetected}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles size={14} />
            <span>Vibe detected: </span>
            <span className={styles.vibeTags}>
              {detectedVibe.mood && <span className={styles.tag}>{detectedVibe.mood}</span>}
              {detectedVibe.genres && <span className={styles.tag}>{detectedVibe.genres.length} genres</span>}
              {detectedVibe.maxDuration && <span className={styles.tag}>{detectedVibe.maxDuration}m max</span>}
              {detectedVibe.minDuration && <span className={styles.tag}>{detectedVibe.minDuration}m+</span>}
              {detectedVibe.country && <span className={styles.tag}>{detectedVibe.country}</span>}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && !query && (
          <motion.div
            className={styles.suggestions}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <p className={styles.suggestionsTitle}>✨ Try asking:</p>
            <div className={styles.suggestionChips}>
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  custom={i}
                  variants={chipVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={styles.chip}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

VibeSearch.propTypes = {
  onSearch: PropTypes.func,
  placeholder: PropTypes.string
};

export default VibeSearch;
