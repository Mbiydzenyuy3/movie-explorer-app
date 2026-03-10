import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Search, X, Sparkles, ArrowRight } from "lucide-react";
import styles from "./VibeSearch.module.css";

// Vibe search mappings to genres/moods
const vibeMappings = {
  // Moods
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

  // Genres
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

  // Regional
  african: { region: "AF", genres: [10769] },
  nigerian: { country: "NG", genres: [10769] },
  nollywood: { country: "NG", genres: [10769] },

  // Time-based
  long: { minDuration: 120 },
  epic: { minDuration: 150, genres: [14, 28] },
  "short film": { maxDuration: 20, genres: [99, 10770] },

  // Quality
  "award winning": { cert: "approved", genres: [18, 36] },
  "critically acclaimed": { minRating: 7.5 },
  popular: { sortBy: "popularity.desc" },
  "top rated": { sortBy: "vote_average.desc" }
};

// Suggestion chips
const suggestions = [
  "Something dark but hopeful",
  "Quick watch under 45 mins",
  "Date night romance",
  "Nigerian movies",
  "Award winning drama",
  "Feel good comedy"
];

const VibeSearch = ({
  onSearch,
  placeholder = 'Try "dark but hopeful" or "quick watch"'
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [detectedVibe, setDetectedVibe] = useState(null);

  // Parse vibe query
  const parseVibeQuery = useCallback((searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchedVibes = [];

    // Check for vibe matches
    Object.entries(vibeMappings).forEach(([key, config]) => {
      if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
        matchedVibes.push({ key, config });
      }
    });

    if (matchedVibes.length > 0) {
      // Use the longest matching key
      const bestMatch = matchedVibes.sort(
        (a, b) => b.key.length - a.key.length
      )[0];
      return bestMatch.config;
    }

    return null;
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Detect vibe
    const vibe = parseVibeQuery(value);
    setDetectedVibe(vibe);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const searchParams = {
        query: query.trim(),
        vibe: detectedVibe
      };
      onSearch?.(searchParams);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    const vibe = parseVibeQuery(suggestion);
    setDetectedVibe(vibe);
    onSearch?.({ query: suggestion, vibe });
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
    setDetectedVibe(null);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div
          className={`${styles.searchBox} ${isFocused ? styles.focused : ""}`}
        >
          <Search size={20} className={styles.searchIcon} />

          <input
            type='text'
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className={styles.searchInput}
          />

          {query && (
            <button
              type='button'
              onClick={handleClear}
              className={styles.clearBtn}
            >
              <X size={18} />
            </button>
          )}

          <button type='submit' className={styles.submitBtn}>
            <ArrowRight size={20} />
          </button>
        </div>
      </form>

      {/* Detected Vibe Display */}
      {detectedVibe && query && (
        <div className={styles.vibeDetected}>
          <Sparkles size={16} />
          <span>Detected: </span>
          <span className={styles.vibeTags}>
            {detectedVibe.mood && (
              <span className={styles.tag}>{detectedVibe.mood}</span>
            )}
            {detectedVibe.genres && (
              <span className={styles.tag}>
                {detectedVibe.genres.length} genres
              </span>
            )}
            {detectedVibe.maxDuration && (
              <span className={styles.tag}>
                {detectedVibe.maxDuration}m max
              </span>
            )}
            {detectedVibe.minDuration && (
              <span className={styles.tag}>{detectedVibe.minDuration}m+</span>
            )}
            {detectedVibe.country && (
              <span className={styles.tag}>{detectedVibe.country}</span>
            )}
          </span>
        </div>
      )}

      {/* Suggestions */}
      {isFocused && !query && (
        <div className={styles.suggestions}>
          <p className={styles.suggestionsTitle}>Try asking:</p>
          <div className={styles.suggestionChips}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={styles.chip}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

VibeSearch.propTypes = {
  onSearch: PropTypes.func,
  placeholder: PropTypes.string
};

export default VibeSearch;
