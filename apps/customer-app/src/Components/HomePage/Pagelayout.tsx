import HeroSection from "./Hero";
import HowItWorks from "./HowItWorks";
import "./PageLayout.css";

export default function PageLayout() {
  return (
    <div className="page-root">

      {/* ── Hero: sticky, stays pinned while next section slides over it ── */}
      <div className="sticky-hero-wrap">
        <HeroSection />
      </div>

      {/* ── All sections below slide over the pinned hero ── */}
      <div className="sections-above">
        <HowItWorks />
        {/* Add more sections here — they will all slide over hero */}
      </div>

    </div>
  );
}
