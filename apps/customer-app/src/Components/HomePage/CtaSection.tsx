import React from "react";
import "./CtaSection.css";

const CtaSection = () => {
  return (
    <section id="cta-section" className="cta-section">
      
      <div className="cta-section__overlay"></div>

      <div className="cta-section__content">
        <h2>Ready to Get Started?</h2>
        <p>
          Join us today and experience a secure and powerful platform built just for you.
        </p>

        <div className="cta-buttons">
          <button className="cta-btn primary">Get Started</button>
          <button className="cta-btn secondary">Learn More</button>
        </div>
      </div>

    </section>
  );
};

export default CtaSection;