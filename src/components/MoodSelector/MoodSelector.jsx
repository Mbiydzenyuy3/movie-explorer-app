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
  ArrowRight
} from "lucide-react";
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

  return (
    <div className={styles.container}>
      {/* Toggle Button */}
      <button
        className={`${styles.toggleBtn} ${isMoodActive ? styles.active : ""}`}
        onClick={toggleMoodMode}
      >
        <Sparkles size={20} />
        <span>{isMoodActive ? "Exit Mood Mode" : "Mood Mode"}</span>
      </button>

      {isMoodActive && (
        <div className={styles.moodPanel}>
          {/* Energy Level Slider */}
          <div className={styles.section}>
            <label className={styles.label}>How is your energy?</label>
            <div className={styles.energySlider}>
              {energyLevels.map((level) => (
                <button
                  key={level.value}
                  className={`${styles.energyBtn} ${energyLevel === level.value ? styles.selected : ""}`}
                  onClick={() => setEnergyLevel(level.value)}
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
            <label className={styles.label}>Time available</label>
            <div className={styles.timeGrid}>
              {timeOptions.map((time) => (
                <button
                  key={time.value}
                  className={`${styles.timeBtn} ${selectedTime === time.value ? styles.selected : ""}`}
                  onClick={() => setSelectedTime(time.value)}
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
        </div>
      )}
    </div>
  );
};

export default MoodSelector;
