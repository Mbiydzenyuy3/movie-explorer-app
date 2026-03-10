import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo
} from "react";
import PropTypes from "prop-types";
import { moodConfig, getMoodFromEnergy } from "../lib/moodConfig";

const MoodContext = createContext(null);

export const MoodProvider = ({ children }) => {
  const [selectedMood, setSelectedMood] = useState("relaxed");
  const [selectedTime, setSelectedTime] = useState(60);
  const [energyLevel, setEnergyLevel] = useState("low");
  const [isMoodActive, setIsMoodActive] = useState(false);

  // Update mood when energy level changes
  const handleEnergyChange = useCallback((level) => {
    setEnergyLevel(level);
    const newMood = getMoodFromEnergy(level);
    setSelectedMood(newMood);
  }, []);

  // Toggle mood discovery mode
  const toggleMoodMode = useCallback(() => {
    setIsMoodActive((prev) => !prev);
    if (!isMoodActive) {
      // Auto-detect mood based on time of day when activating
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 6) {
        setSelectedMood("relaxed");
        setEnergyLevel("low");
      } else if (hour >= 18) {
        setSelectedMood("tense");
        setEnergyLevel("medium");
      } else {
        setSelectedMood("energetic");
        setEnergyLevel("high");
      }
    }
  }, [isMoodActive]);

  // Get current mood configuration
  const currentMoodConfig = useMemo(() => {
    return moodConfig[selectedMood] || moodConfig.relaxed;
  }, [selectedMood]);

  const value = {
    // State
    selectedMood,
    selectedTime,
    energyLevel,
    isMoodActive,
    currentMoodConfig,

    // Actions
    setSelectedMood,
    setSelectedTime,
    setEnergyLevel: handleEnergyChange,
    toggleMoodMode,

    // Helpers
    resetMood: () => {
      setSelectedMood("relaxed");
      setSelectedTime(60);
      setEnergyLevel("low");
      setIsMoodActive(false);
    }
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

MoodProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMood must be used within a MoodProvider");
  }
  return context;
};

export default MoodContext;
