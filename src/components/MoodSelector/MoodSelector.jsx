import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMood } from "../../context/MoodContext";
import { moodConfig, timeOptions, energyLevels } from "../../lib/moodConfig";
import {
  Sparkles,
  Zap,
  Leaf,
  Drama,
  Compass,
  Clock,
  Search,
  Heart,
  Skull,
  ArrowRight,
  Loader2,
  X
} from "lucide-react";
import { useNavigate } from "react-router";
import styles from "./MoodSelector.module.css";

const moodIcons = {
  energetic: Zap,
  relaxed: Leaf,
  tense: Drama,
  adventurous: Compass,
  nostalgic: Clock,
  curious: Search,
  romantic: Heart,
  dark: Skull
};

const panelVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: "easeOut" }
  })
};

const MoodSelector = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const {
    selectedMood,
    selectedTime,
    energyLevel,
    isMoodActive,
    setSelectedMood,
    setSelectedTime,
    setEnergyLevel,
    toggleMoodMode
  } = useMood();

  const MoodIcon = moodIcons[selectedMood] || Sparkles;

  const handleFindMovies = () => {
    setIsSearching(true);
    const params = new URLSearchParams({
      vibe: selectedMood,
      time: selectedTime.toString(),
      energy: energyLevel
    });
    navigate(`/search?${params.toString()}`);
    toggleMoodMode();
    setIsSearching(false);
  };

  const getTimeDisplay = () => {
    const time = timeOptions.find((t) => t.value === selectedTime);
    return time ? time.label : "Any length";
  };

  return (
    <div className={styles.container}>
      {/* Toggle Button */}
      <motion.button
        className={`${styles.toggleBtn} ${isMoodActive ? styles.active : ""}`}
        onClick={toggleMoodMode}
        aria-expanded={isMoodActive}
        aria-controls="mood-panel"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span
          animate={{ rotate: isMoodActive ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles size={20} />
        </motion.span>
        <span>{isMoodActive ? "Exit Mood Mode" : "Mood Mode"}</span>
      </motion.button>

      <AnimatePresence>
        {isMoodActive && (
          <motion.div
            className={styles.moodPanel}
            id="mood-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Panel Header */}
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>
                <Sparkles size={16} /> Set Your Vibe
              </h3>
              <motion.button
                className={styles.closePanel}
                onClick={toggleMoodMode}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Energy Level */}
            <div className={styles.section}>
              <label className={styles.label}>How is your energy?</label>
              <div className={styles.energySlider}>
                {energyLevels.map((level, i) => (
                  <motion.button
                    key={level.value}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={`${styles.energyBtn} ${energyLevel === level.value ? styles.selected : ""}`}
                    onClick={() => setEnergyLevel(level.value)}
                    aria-pressed={energyLevel === level.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={styles.energyLabel}>{level.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mood Grid */}
            <div className={styles.section}>
              <label className={styles.label}>Pick your vibe</label>
              <div className={styles.moodGrid}>
                {Object.entries(moodConfig).map(([key, config], i) => {
                  const Icon = moodIcons[key] || Sparkles;
                  const isSelected = selectedMood === key;
                  return (
                    <motion.button
                      key={key}
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className={`${styles.moodBtn} ${isSelected ? styles.selected : ""}`}
                      style={{
                        "--mood-color": config.color,
                        borderColor: isSelected ? config.color : "transparent",
                        boxShadow: isSelected
                          ? `0 0 16px ${config.color}55`
                          : "none"
                      }}
                      onClick={() => setSelectedMood(key)}
                      aria-pressed={isSelected}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon size={24} className={styles.moodIcon} />
                      <span className={styles.moodLabel}>{config.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className={styles.section}>
              <label className={styles.label}>
                Time available: {getTimeDisplay()}
              </label>
              <div className={styles.timeGrid}>
                {timeOptions.map((time, i) => (
                  <motion.button
                    key={time.value}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={`${styles.timeBtn} ${selectedTime === time.value ? styles.selected : ""}`}
                    onClick={() => setSelectedTime(time.value)}
                    aria-pressed={selectedTime === time.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {time.shortLabel}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Current Mood Display */}
            <motion.div
              className={styles.currentMood}
              style={{ backgroundColor: moodConfig[selectedMood]?.color + "25", borderColor: moodConfig[selectedMood]?.color + "55" }}
              layout
            >
              <motion.div
                key={selectedMood}
                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <MoodIcon size={40} className={styles.currentMoodIcon} style={{ color: moodConfig[selectedMood]?.color }} />
              </motion.div>
              <div className={styles.currentMoodText}>
                <strong>{moodConfig[selectedMood]?.label}</strong>
                <span>{moodConfig[selectedMood]?.description}</span>
              </div>
              <ArrowRight size={20} className={styles.arrowIcon} />
            </motion.div>

            {/* Find Movies Button */}
            <motion.button
              className={styles.findMoviesBtn}
              onClick={handleFindMovies}
              disabled={isSearching}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSearching ? (
                <>
                  <Loader2 size={20} className={styles.spinner} />
                  <span>Finding movies...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Find Movies</span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodSelector;
