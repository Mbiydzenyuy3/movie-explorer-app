import { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Zap,
  Leaf,
  Drama,
  Compass,
  Ghost,
  Heart,
  Moon,
  Clock
} from "lucide-react";
import { useMood } from "../../context/MoodContext";
import { useNavigate } from "react-router";
import styles from "./VibeSelector.module.css";

const vibeIcons = {
  energetic: Zap,
  relaxed: Leaf,
  tense: Drama,
  adventurous: Compass,
  nostalgic: Ghost,
  curious: Heart,
  romantic: Moon,
  dark: Clock
};

const vibes = [
  {
    id: "energetic",
    name: "Energetic",
    description: "Action-packed, high energy"
  },
  {
    id: "relaxed",
    name: "Relaxed",
    description: "Light, easy watching"
  },
  {
    id: "tense",
    name: "Tense",
    description: "Thrillers, suspense"
  },
  {
    id: "adventurous",
    name: "Adventurous",
    description: "Adventure, exploration"
  },
  {
    id: "nostalgic",
    name: "Nostalgic",
    description: "Classics, throwbacks"
  },
  {
    id: "curious",
    name: "Curious",
    description: "Mysteries, documentaries"
  },
  {
    id: "romantic",
    name: "Romantic",
    description: "Love stories, dramas"
  },
  {
    id: "dark",
    name: "Dark",
    description: "Dark, intense content"
  }
];

export default function VibeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const { setMood, isMoodActive } = useMood();
  const navigate = useNavigate();

  const handleVibeSelect = (vibe) => {
    setSelectedVibe(vibe);
    setMood({
      id: vibe.id,
      name: vibe.name,
      energy: vibe.id === "energetic" ? 0.8 : vibe.id === "relaxed" ? 0.2 : 0.5
    });
    setShowSearch(true);
  };

  const handleSearch = () => {
    if (selectedVibe) {
      navigate(`/search?query=${selectedVibe.name}&vibe=${selectedVibe.id}`);
      setIsOpen(false);
      setShowSearch(false);
      setSelectedVibe(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowSearch(false);
    setSelectedVibe(null);
  };

  // Don't show if mood is already active on home page
  if (isMoodActive) {
    return null;
  }

  const VibeIcon = selectedVibe ? vibeIcons[selectedVibe.id] : Sparkles;

  return (
    <>
      {/* Floating Chatbot Button */}
      <button
        className={styles.floatingBtn}
        onClick={() => setIsOpen(true)}
        aria-label='Open Vibe Selector'
      >
        <Sparkles size={24} />
      </button>

      {/* Chatbot Panel */}
      {isOpen && (
        <div className={styles.chatbot}>
          <div className={styles.chatbotHeader}>
            <div className={styles.headerIcon}>
              <Sparkles size={20} />
            </div>
            <div className={styles.headerText}>
              <h3>Vibe Selector</h3>
              <p>How are you feeling today?</p>
            </div>
            <button className={styles.closeBtn} onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          {!showSearch ? (
            <div className={styles.vibeGrid}>
              {vibes.map((vibe) => {
                const Icon = vibeIcons[vibe.id];
                return (
                  <button
                    key={vibe.id}
                    className={`${styles.vibeCard} ${selectedVibe?.id === vibe.id ? styles.selected : ""}`}
                    onClick={() => handleVibeSelect(vibe)}
                  >
                    {Icon && <Icon size={24} className={styles.vibeIcon} />}
                    <span className={styles.vibeName}>{vibe.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.searchPanel}>
              <div className={styles.selectedVibe}>
                <VibeIcon size={18} />
                <span>Looking for {selectedVibe?.name} movies</span>
              </div>

              <button className={styles.searchBtn} onClick={handleSearch}>
                <span>Search {selectedVibe?.name}</span>
                <Send size={18} />
              </button>

              <button
                className={styles.backBtn}
                onClick={() => setShowSearch(false)}
              >
                ← Choose different vibe
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
