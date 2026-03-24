import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Keyboard,
  Settings,
  X,
  Check
} from "lucide-react";
import { useAccessibility } from "../../context/AccessibilityContext";
import styles from "./AccessibilityMenu.module.css";

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const {
    highContrast,
    reducedMotion,
    screenReaderMode,
    toggleHighContrast,
    toggleReducedMotion,
    toggleScreenReaderMode
  } = useAccessibility();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.container} ref={menuRef} onKeyDown={handleKeyDown}>
      {/* Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Settings size={20} />
        <span className={styles.srOnly}>Accessibility</span>
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <div
          className={styles.menu}
          role="menu"
          aria-label="Accessibility options"
        >
          <div className={styles.menuHeader}>
            <h3>Accessibility</h3>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.menuContent}>
            {/* High Contrast */}
            <button
              className={styles.option}
              onClick={toggleHighContrast}
              role="menuitem"
              aria-pressed={highContrast}
            >
              <div className={styles.optionIcon}>
                {highContrast ? <Eye size={18} /> : <EyeOff size={18} />}
              </div>
              <div className={styles.optionText}>
                <span className={styles.optionLabel}>High Contrast</span>
                <span className={styles.optionDesc}>
                  Increase color contrast for better visibility
                </span>
              </div>
              <div
                className={`${styles.checkbox} ${highContrast ? styles.checked : ""}`}
                aria-hidden="true"
              >
                {highContrast && <Check size={14} />}
              </div>
            </button>

            {/* Reduced Motion */}
            <button
              className={styles.option}
              onClick={toggleReducedMotion}
              role="menuitem"
              aria-pressed={reducedMotion}
            >
              <div className={styles.optionIcon}>
                <VolumeX size={18} />
              </div>
              <div className={styles.optionText}>
                <span className={styles.optionLabel}>Reduce Motion</span>
                <span className={styles.optionDesc}>
                  Minimize animations and transitions
                </span>
              </div>
              <div
                className={`${styles.checkbox} ${reducedMotion ? styles.checked : ""}`}
                aria-hidden="true"
              >
                {reducedMotion && <Check size={14} />}
              </div>
            </button>

            {/* Screen Reader Mode */}
            <button
              className={styles.option}
              onClick={toggleScreenReaderMode}
              role="menuitem"
              aria-pressed={screenReaderMode}
            >
              <div className={styles.optionIcon}>
                {screenReaderMode ? <Volume2 size={18} /> : <Keyboard size={18} />}
              </div>
              <div className={styles.optionText}>
                <span className={styles.optionLabel}>Screen Reader</span>
                <span className={styles.optionDesc}>
                  Optimize for screen reader accessibility
                </span>
              </div>
              <div
                className={`${styles.checkbox} ${screenReaderMode ? styles.checked : ""}`}
                aria-hidden="true"
              >
                {screenReaderMode && <Check size={14} />}
              </div>
            </button>
          </div>

          <div className={styles.menuFooter}>
            <p className={styles.footerText}>
              Press <kbd>Tab</kbd> to navigate between options
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
