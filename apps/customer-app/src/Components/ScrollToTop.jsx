import { useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import "./ScrollToTop.css";

/** Same blue as Hero (`Hero.css` --blue) */
const SCROLL_SHOW_AFTER = 380;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const doc = document.documentElement;
      const max = Math.max(0, (doc?.scrollHeight ?? 0) - (doc?.clientHeight ?? 0));
      const pct = max > 0 ? Math.round((y / max) * 100) : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      setVisible(y > SCROLL_SHOW_AFTER);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-to-top"
      onClick={goTop}
      aria-label="Scroll back to top"
    >
      <FaChevronUp className="scroll-to-top__icon" aria-hidden />
      <span className="scroll-to-top__pct" aria-hidden>
        {progress}%
      </span>
    </button>
  );
}
