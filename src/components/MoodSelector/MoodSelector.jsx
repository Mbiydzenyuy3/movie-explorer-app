import { useState } from "react";
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
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router";
import styles from "./MoodSelector.module.css";

// Map mood keys to icons
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

  // Handle finding movies based on current selections
  const handleFindMovies = () => {
    setIsSearching(true);

    // Build query params
    const params = new URLSearchParams({
      vibe: selectedMood,
      time: selectedTime.toString(),
      energy: energyLevel
    });

    // Navigate to search page with mood parameters
    navigate(`/search?${params.toString()}`);

    // Close the mood panel
    toggleMoodMode();
    setIsSearching(false);
  };

  // Get the display text for selected time
  const getTimeDisplay = () => {
    const time = timeOptions.find((t) => t.value === selectedTime);
    return time ? time.label : "Any length";
  };

  return (
    <div className={styles.container}>
      {/* Toggle Button */}
      <button
        className={`${styles.toggleBtn} ${isMoodActive ? styles.active : ""}`}
        onClick={toggleMoodMode}
        aria-expanded={isMoodActive}
        aria-controls='mood-panel'
      >
        <Sparkles size={20} />
        <span>{isMoodActive ? "Exit Mood Mode" : "Mood Mode"}</span>
      </button>

      {isMoodActive && (
        <div className={styles.moodPanel} id='mood-panel'>
          {/* Energy Level Slider */}
          <div className={styles.section}>
            <label className={styles.label}>How is your energy?</label>
            <div className={styles.energySlider}>
              {energyLevels.map((level) => (
                <button
                  key={level.value}
                  className={`${styles.energyBtn} ${energyLevel === level.value ? styles.selected : ""}`}
                  onClick={() => setEnergyLevel(level.value)}
                  aria-pressed={energyLevel === level.value}
                >
                  <span className={styles.energyLabel}>{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selection */}
          <div className={styles.section}>
            <label className={styles.label}>Pick your vibe</label>
            <div className={styles.moodGrid}>
              {Object.entries(moodConfig).map(([key, config]) => {
                const Icon = moodIcons[key] || Sparkles;
                return (
                  <button
                    key={key}
                    className={`${styles.moodBtn} ${selectedMood === key ? styles.selected : ""}`}
                    style={{
                      "--mood-color": config.color,
                      borderColor:
                        selectedMood === key ? config.color : "transparent"
                    }}
                    onClick={() => setSelectedMood(key)}
                    aria-pressed={selectedMood === key}
                  >
                    <Icon size={24} className={styles.moodIcon} />
                    <span className={styles.moodLabel}>{config.label}</span>
                  </button>
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
              {timeOptions.map((time) => (
                <button
                  key={time.value}
                  className={`${styles.timeBtn} ${selectedTime === time.value ? styles.selected : ""}`}
                  onClick={() => setSelectedTime(time.value)}
                  aria-pressed={selectedTime === time.value}
                >
                  {time.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Current Mood Display */}
          <div
            className={styles.currentMood}
            style={{ backgroundColor: moodConfig[selectedMood]?.color }}
          >
            <MoodIcon size={48} className={styles.currentMoodIcon} />
            <div className={styles.currentMoodText}>
              <strong>{moodConfig[selectedMood]?.label}</strong>
              <span>{moodConfig[selectedMood]?.description}</span>
            </div>
            <ArrowRight size={24} className={styles.arrowIcon} />
          </div>

          {/* Find Movies Button */}
          <button
            className={styles.findMoviesBtn}
            onClick={handleFindMovies}
            disabled={isSearching}
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
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;
