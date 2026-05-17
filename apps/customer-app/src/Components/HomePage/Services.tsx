import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  FiZap,
  FiSquare,
  FiSmartphone,
  FiBatteryCharging,
  FiShield,
  FiCamera,
  FiPower,
} from "react-icons/fi";
import "./Services.css";

/* ─── DATA ───────────────────────────────────────────── */
const filters = [
  { id: "all",   label: "All Services",   Icon: FiZap },
  { id: "glass", label: "Glass",          Icon: FiSquare },
  { id: "display", label: "Display",      Icon: FiSmartphone },
  { id: "battery", label: "Battery",      Icon: FiBatteryCharging },
  { id: "cover",  label: "Mobile Cover",  Icon: FiShield },
  { id: "camera", label: "Camera",        Icon: FiCamera },
  { id: "charging", label: "Charging Port", Icon: FiPower },
];

/** Maps home card → pricing catalog slug in `repairFlowData` */
const services = [
  {
    id: 1, category: "glass",
    pricingServiceId: "screen-replacement",
    title: "Screen Glass Replacement",
    desc: "Cracked outer glass? We replace it with premium Gorilla Glass that's scratch-resistant and oleophobic coated.",
    price: "₹499",
    time: "30 mins",
    tag: "Most Popular",
    tagColor: "#FF6B35",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80",
  },
  {
    id: 2, category: "glass",
    pricingServiceId: "screen-replacement",
    title: "Tempered Glass Fitting",
    desc: "Dust-free professional tempered glass installation with lifetime warranty against bubbles.",
    price: "₹199",
    time: "10 mins",
    tag: "Quick Fix",
    tagColor: "#00C9A7",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
  },
  {
    id: 3, category: "display",
    pricingServiceId: "screen-replacement",
    title: "AMOLED Display Replacement",
    desc: "Restore your phone's stunning visuals with an OEM-grade AMOLED panel. True colours, deep blacks.",
    price: "₹1,999",
    time: "1 hour",
    tag: "Premium",
    tagColor: "#6C63FF",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
  },
  {
    id: 4, category: "display",
    pricingServiceId: "screen-replacement",
    title: "LCD Display Repair",
    desc: "Dead pixels, touch issues, backlight gone? Our LCD repair brings your screen back to factory condition.",
    price: "₹999",
    time: "45 mins",
    tag: "Budget Fix",
    tagColor: "#00C9A7",
    image: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&q=80",
  },
  {
    id: 5, category: "battery",
    pricingServiceId: "battery-replacement",
    title: "Battery Replacement",
    desc: "Draining too fast? We swap in a high-capacity OEM battery that lasts all day. Health restored to 100%.",
    price: "₹699",
    time: "30 mins",
    tag: "Fast Service",
    tagColor: "#FF6B35",
    image: "https://images.unsplash.com/photo-1609592424823-3bf3dad8be69?w=600&q=80",
  },
  {
    id: 6, category: "battery",
    pricingServiceId: "battery-replacement",
    title: "Battery Health Check",
    desc: "Full battery diagnostics — capacity, charge cycles, temperature, and health score report.",
    price: "₹99",
    time: "10 mins",
    tag: "Free Report",
    tagColor: "#F72585",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: 7, category: "cover",
    pricingServiceId: "screen-replacement",
    title: "Custom Mobile Cover",
    desc: "Design your own or pick from 500+ ready templates. Printed in HD on shockproof polycarbonate.",
    price: "₹299",
    time: "20 mins",
    tag: "Customize",
    tagColor: "#6C63FF",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",
  },
  {
    id: 8, category: "cover",
    pricingServiceId: "screen-replacement",
    title: "Rugged Armor Case",
    desc: "Military-grade drop protection with raised edges, anti-slip grip, and precise cutouts.",
    price: "₹599",
    time: "5 mins",
    tag: "Top Rated",
    tagColor: "#FF6B35",
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80",
  },
  {
    id: 9, category: "camera",
    pricingServiceId: "camera-repair",
    title: "Camera Lens Replacement",
    desc: "Blurry shots? Cracked lens? We replace with OEM glass for crystal-clear photos every time.",
    price: "₹399",
    time: "25 mins",
    tag: "Quick Fix",
    tagColor: "#00C9A7",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
  },
  {
    id: 10, category: "charging",
    pricingServiceId: "charging-port-repair",
    title: "Charging Port Repair",
    desc: "Loose port, slow charging, not detecting cable? Full port cleaning or replacement done in minutes.",
    price: "₹499",
    time: "30 mins",
    tag: "Common Fix",
    tagColor: "#F72585",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80",
  },
];

/* Category → hero image mapping */
const heroImages = {
  all:      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
  glass:    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
  display:  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  battery:  "https://images.unsplash.com/photo-1609592424823-3bf3dad8be69?w=800&q=80",
  cover:    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
  camera:   "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
  charging: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
};

const VISIBLE = 5; // filters visible at a time

export default function OurServices() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterOffset, setFilterOffset] = useState(0);
  const [prevFilter, setPrevFilter] = useState("all");

  /* refs for GSAP */
  const sectionRef    = useRef(null);
  const heroImgRef    = useRef(null);
  const cardsRef      = useRef(null);
  const filtersRef    = useRef(null);
  const headerRef     = useRef(null);

  const filtered = activeFilter === "all"
    ? services
    : services.filter((s) => s.category === activeFilter);

  /* ── initial entrance animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo(heroImgRef.current,
        { opacity: 0, scale: 0.94, x: -30 },
        { opacity: 1, scale: 1, x: 0, duration: 0.9, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(filtersRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.35 }
      );
      gsap.fromTo(".srv-card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.08, delay: 0.5 }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── filter change: hero image + cards animation ── */
  const handleFilter = (id) => {
    if (id === activeFilter) return;
    setPrevFilter(activeFilter);

    /* hero image cross-fade */
    gsap.to(heroImgRef.current, {
      opacity: 0, scale: 1.04, duration: 0.25, ease: "power2.in",
      onComplete: () => {
        setActiveFilter(id);
        gsap.fromTo(heroImgRef.current,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
        );
      },
    });

    /* cards stagger out → in */
    gsap.to(".srv-card", {
      opacity: 0, y: 16, duration: 0.2, ease: "power2.in", stagger: 0.03,
      onComplete: () => {
        setActiveFilter(id);
        requestAnimationFrame(() => {
          gsap.fromTo(".srv-card",
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.07 }
          );
        });
      },
    });
  };

  /* filter carousel scroll */
  const canLeft  = filterOffset > 0;
  const canRight = filterOffset + VISIBLE < filters.length;

  const slideFilters = (dir) => {
    const newOffset = filterOffset + dir;
    if (newOffset < 0 || newOffset + VISIBLE > filters.length) return;
    gsap.fromTo(filtersRef.current,
      { x: dir > 0 ? 10 : -10 },
      { x: 0, duration: 0.3, ease: "power2.out" }
    );
    setFilterOffset(newOffset);
  };

  const visibleFilters = filters.slice(filterOffset, filterOffset + VISIBLE);
  const currentColor = "#FF6B35"; // accent stays consistent

  return (
    <section className="srv-section" ref={sectionRef}>
      <div className="srv-bg-blob" />

      {/* ── HEADER ── */}
      <div className="srv-header" ref={headerRef}>
       
        <h2 className="srv-title">
          Expert Repairs, <em>Lightning Fast</em>
        </h2>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="srv-body">

        {/* ════ LEFT — HERO IMAGE ════ */}
        <div className="srv-left">
          <div className="srv-img-frame" ref={heroImgRef}>
            <img
              key={activeFilter}
              src={heroImages[activeFilter]}
              alt={activeFilter}
              className="srv-hero-img"
            />
            {/* overlay badge */}
            <div className="srv-img-badge">
              {(() => {
                const current = filters.find((f) => f.id === activeFilter);
                const Icon = current?.Icon;
                return (
                  <>
                    {Icon ? <Icon aria-hidden /> : null}&nbsp;
                    {current?.label}
                  </>
                );
              })()}
            </div>
            {/* count bubble */}
            <div className="srv-img-count">
              <span className="srv-count-num">{filtered.length}</span>
              <span className="srv-count-label">Services</span>
            </div>
            <div className="srv-img-deco" />
          </div>

          {/* Stat chips below image */}
          <div className="srv-stats">
            {[
              { val: "50K+", lbl: "Repairs Done" },
              { val: "4.9★", lbl: "Avg Rating" },
              { val: "1 Yr",  lbl: "Warranty" },
            ].map((s) => (
              <div key={s.lbl} className="srv-stat-chip">
                <span className="srv-stat-val">{s.val}</span>
                <span className="srv-stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ════ RIGHT — FILTERS + CARDS ════ */}
        <div className="srv-right">

          {/* Filter carousel */}
          <div className="srv-filter-row">
            <button
              className={`srv-arrow-btn${canLeft ? "" : " srv-arrow-btn--disabled"}`}
              onClick={() => slideFilters(-1)}
              disabled={!canLeft}
            >‹</button>

            <div className="srv-filters-wrap">
              <div className="srv-filters" ref={filtersRef}>
                {visibleFilters.map((f) => (
                  <button
                    key={f.id}
                    className={`srv-filter-btn${activeFilter === f.id ? " srv-filter-btn--active" : ""}`}
                    onClick={() => handleFilter(f.id)}
                  >
                    <span className="srv-filter-icon" aria-hidden>
                      <f.Icon />
                    </span>
                    <span className="srv-filter-label">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className={`srv-arrow-btn${canRight ? "" : " srv-arrow-btn--disabled"}`}
              onClick={() => slideFilters(1)}
              disabled={!canRight}
            >›</button>
          </div>

          {/* Cards grid */}
          <div className="srv-cards" ref={cardsRef}>
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                className="srv-card"
                onClick={() =>
                  navigate(`/brand?service=${encodeURIComponent(s.pricingServiceId)}`)
                }
              >
                <div className="srv-card__wrap">
                  <div className="srv-card__ring" />
                  <div className="srv-card__circle">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="srv-card__img"
                      draggable={false}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0";
                      }}
                    />
                  </div>
                </div>
                <p className="srv-card__name">{s.title}</p>
              </button>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
