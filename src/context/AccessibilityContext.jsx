import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import PropTypes from "prop-types";

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  // High Contrast Mode
  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem("highContrast");
    return saved ? JSON.parse(saved) : false;
  });

  // Reduced Motion
  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem("reducedMotion");
    if (saved) return JSON.parse(saved);
    // Check system preference
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Screen Reader Mode
  const [screenReaderMode, setScreenReaderMode] = useState(() => {
    const saved = localStorage.getItem("screenReaderMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Keyboard Navigation Enabled
  const [keyboardNavigation, setKeyboardNavigation] = useState(true);

  // Apply high contrast to document
  useEffect(() => {
    document.documentElement.setAttribute("data-high-contrast", highContrast);
    localStorage.setItem("highContrast", JSON.stringify(highContrast));
  }, [highContrast]);

  // Apply reduced motion to document
  useEffect(() => {
    document.documentElement.setAttribute("data-reduced-motion", reducedMotion);
    localStorage.setItem("reducedMotion", JSON.stringify(reducedMotion));
  }, [reducedMotion]);

  // Apply screen reader mode
  useEffect(() => {
    if (screenReaderMode) {
      document.body.classList.add("sr-mode");
    } else {
      document.body.classList.remove("sr-mode");
    }
    localStorage.setItem("screenReaderMode", JSON.stringify(screenReaderMode));
  }, [screenReaderMode]);

  // Toggle functions
  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => !prev);
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => !prev);
  }, []);

  const toggleScreenReaderMode = useCallback(() => {
    setScreenReaderMode((prev) => !prev);
  }, []);

  const enableKeyboardNavigation = useCallback(() => {
    setKeyboardNavigation(true);
  }, []);

  const disableKeyboardNavigation = useCallback(() => {
    setKeyboardNavigation(false);
  }, []);

  // Check system preferences on mount
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const contrastQuery = window.matchMedia("(prefers-contrast: more)");

    const handleMotionChange = (e) => {
      if (!localStorage.getItem("reducedMotion")) {
        setReducedMotion(e.matches);
      }
    };

    const handleContrastChange = (e) => {
      if (!localStorage.getItem("highContrast")) {
        setHighContrast(e.matches);
      }
    };

    motionQuery.addEventListener("change", handleMotionChange);
    contrastQuery.addEventListener("change", handleContrastChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      contrastQuery.removeEventListener("change", handleContrastChange);
    };
  }, []);

  const value = {
    // State
    highContrast,
    reducedMotion,
    screenReaderMode,
    keyboardNavigation,

    // Actions
    setHighContrast,
    setReducedMotion,
    setScreenReaderMode,
    toggleHighContrast,
    toggleReducedMotion,
    toggleScreenReaderMode,
    enableKeyboardNavigation,
    disableKeyboardNavigation
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

AccessibilityProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
};

export default AccessibilityContext;
