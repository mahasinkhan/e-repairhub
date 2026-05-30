import React, { useEffect, useState } from "react";
import "./TrustedBy.css";
import { FiArrowRight, FiTag, FiCopy, FiCheck } from "react-icons/fi";

const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

const brands = ["Apple", "Samsung", "OnePlus", "Mi", "realme", "vivo", "oppo", "motorola", "Nokia"];

// ── Live countdown ────────────────────────────────────────────────────────────
function useCountdown(targetDate: Date | null) {
  const calc = () => {
    if (!targetDate) return { days: "00", hrs: "00", mins: "00", secs: "00", expired: false };
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: "00", hrs: "00", mins: "00", secs: "00", expired: true };
    const days = Math.floor(diff / 86400000);
    const hrs  = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const pad  = (n: number) => String(n).padStart(2, "0");
    return { days: pad(days), hrs: pad(hrs), mins: pad(mins), secs: pad(secs), expired: false };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}

// ── Main component ────────────────────────────────────────────────────────────
const TrustedBy = () => {
  const [coupon,  setCoupon]  = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    fetch(`${BASE}/discounts/featured`)
      .then(r => r.json())
      .then(data => {
        if (data?.success && data?.data) setCoupon(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const expiryDate = coupon?.expiresAt ? new Date(coupon.expiresAt) : null;
  const countdown  = useCountdown(expiryDate);

  const handleCopy = () => {
    if (!coupon?.code) return;
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Build display text from coupon
  const discountText = coupon
    ? coupon.type === "percentage"
      ? `Flat ${coupon.value}% OFF`
      : `Flat ₹${coupon.value} OFF`
    : "Flat 20% OFF";

  const offerTitle = coupon?.description || `${discountText} on All Repairs`;

  const applicableText = coupon?.applicableTo === "brand"
    ? `Valid for ${coupon.brandName}`
    : coupon?.applicableTo === "service"
    ? `Valid for ${coupon.serviceName}`
    : "on All Repairs";

  const offerTimerItems = [
    { value: countdown.days, label: "Days" },
    { value: countdown.hrs,  label: "Hrs"  },
    { value: countdown.mins, label: "Mins" },
    { value: countdown.secs, label: "Secs" },
  ];

  const validTillText = expiryDate
    ? `Offer Valid Till ${expiryDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`
    : "Limited Time Offer";

  // Hide if no coupon and done loading
  const showOffer = !loading && coupon && !countdown.expired;

  return (
    <section className="trusted-by" aria-label="Trusted by customers">

      {/* ── Offer Banner — dynamic ─────────────────────────────────────────── */}
      {showOffer && (
        <div className="trusted-by__offer" aria-label="Special repair offer">
          {/* Icon */}
          <div className="trusted-by__offer-icon">
            <FiTag />
            <span>Offer</span>
          </div>

          {/* Copy */}
          <div className="trusted-by__offer-copy">
            <span>Special Offer</span>
            <strong>
              <b>{discountText}</b> {applicableText}
            </strong>
          </div>

          {/* Coupon code — clickable to copy */}
          <div className="trusted-by__offer-code" style={{ cursor: "pointer" }} onClick={handleCopy} title="Click to copy">
            <span>Use Code:</span>
            <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {coupon.code}
              {copied
                ? <FiCheck size={14} color="#22c55e" />
                : <FiCopy size={12} style={{ opacity: 0.6 }} />
              }
            </strong>
            {copied && <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>Copied!</span>}
          </div>

          {/* Countdown */}
          <div className="trusted-by__offer-countdown">
            <p>{validTillText}</p>
            <div>
              {offerTimerItems.map(item => (
                <span key={item.label}>
                  <strong>{item.value}</strong>
                  <small>{item.label}</small>
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <a href="/book" className="trusted-by__offer-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Book Now <FiArrowRight />
          </a>
        </div>
      )}

      {/* ── Trusted by heading ────────────────────────────────────────────── */}
      <div className="trusted-by__heading">
        <span />
        <p>Trusted by 50,000+ happy customers across India</p>
        <span />
      </div>

      {/* ── Brand logos ───────────────────────────────────────────────────── */}
      <div className="trusted-by__logos">
        {brands.map(brand => (
          <div className={`trusted-by__logo trusted-by__logo--${brand.toLowerCase()}`} key={brand}>
            {brand}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustedBy;