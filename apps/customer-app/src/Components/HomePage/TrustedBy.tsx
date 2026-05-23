import React from "react";
import "./TrustedBy.css";
import { FiArrowRight, FiTag } from "react-icons/fi";

const brands = ["Apple", "Samsung", "OnePlus", "Mi", "realme", "vivo", "oppo", "motorola", "Nokia"];

const offerTimer = [
  { value: "08", label: "Days" },
  { value: "12", label: "Hrs" },
  { value: "45", label: "Mins" },
  { value: "30", label: "Secs" },
];

const TrustedBy = () => {
  return (
    <section className="trusted-by" aria-label="Trusted by customers">
      <div className="trusted-by__offer" aria-label="Weekend special repair offer">
        <div className="trusted-by__offer-icon">
          <FiTag />
          <span>Offer</span>
        </div>

        <div className="trusted-by__offer-copy">
          <span>Weekend Special Offer</span>
          <strong>
            Flat <b>20% OFF</b> on All Repairs
          </strong>
        </div>

        <div className="trusted-by__offer-code">
          <span>Use Code:</span>
          <strong>REPAIR20</strong>
        </div>

        <div className="trusted-by__offer-countdown">
          <p>Offer Valid Till 31st May 2026</p>
          <div>
            {offerTimer.map((item) => (
              <span key={item.label}>
                <strong>{item.value}</strong>
                <small>{item.label}</small>
              </span>
            ))}
          </div>
        </div>

        <button className="trusted-by__offer-button" type="button">
          Book Now
          <FiArrowRight />
        </button>
      </div>

      <div className="trusted-by__heading">
        <span />
        <p>Trusted by 50,000+ happy customers across India</p>
        <span />
      </div>

      <div className="trusted-by__logos">
        {brands.map((brand) => (
          <div className={`trusted-by__logo trusted-by__logo--${brand.toLowerCase()}`} key={brand}>
            {brand}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustedBy;
