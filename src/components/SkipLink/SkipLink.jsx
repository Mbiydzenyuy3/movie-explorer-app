import { useCallback } from "react";

export default function SkipLink() {
  const handleSkip = useCallback((e) => {
    e.preventDefault();
    const main = document.getElementById("main-content");
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <a href='#main-content' className='skip-link' onClick={handleSkip}>
      Skip to main content
    </a>
  );
}
