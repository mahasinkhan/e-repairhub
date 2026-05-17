import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./WhyChooseUs.css";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    iconClass: "ic-blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "6 months warranty",
    desc: "Covered on every repair we perform.",
  },
  {
    iconClass: "ic-green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Verified repair centers",
    desc: "Only trusted, certified hubs — not random shops.",
  },
  {
    iconClass: "ic-violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Safe pickup & delivery",
    desc: "Tracked, sealed, and fully protected in transit.",
  },
  {
    iconClass: "ic-amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: "Transparent pricing",
    desc: "No hidden charges. What you see is what you pay.",
  },
  {
    iconClass: "ic-teal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    title: "Affordable for every budget",
    desc: "Better experience than local shops at fair prices.",
  },
];

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const trigger = { trigger: root, start: "top 72%" };

      gsap.set(".why-eyebrow", { opacity: 0, y: 14 });
      gsap.set(".why-title", { opacity: 0, y: 20 });
      gsap.set(".why-desc", { opacity: 0, y: 16 });
      gsap.set(".why-card", { opacity: 0, x: 24 });
      gsap.set(".why-img-wrap", { opacity: 0, scale: 0.96, transformOrigin: "center center" });
      gsap.set(".why-badge", { opacity: 0, y: 16, scale: 0.92 });

      const tl = gsap.timeline({ scrollTrigger: trigger });

      tl.to(".why-img-wrap", { opacity: 1, scale: 1, duration: 0.75, ease: "power3.out" })
        .to(".why-badge", { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(2)" }, "-=0.3")
        .to(".why-eyebrow", { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.4")
        .to(".why-title", { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, "-=0.3")
        .to(".why-desc", { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.3")
        .to(".why-card", { opacity: 1, x: 0, duration: 0.42, stagger: 0.075, ease: "power3.out" }, "-=0.2");

      // Card hover
      root.querySelectorAll<HTMLElement>(".why-card").forEach((card) => {
        const icon = card.querySelector<HTMLElement>(".why-icon");
        card.addEventListener("mouseenter", () => {
          gsap.to(card, { y: -3, duration: 0.22, ease: "power2.out" });
          if (icon) gsap.to(icon, { rotation: -6, scale: 1.12, duration: 0.22, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { y: 0, duration: 0.2, ease: "power2.inOut" });
          if (icon) gsap.to(icon, { rotation: 0, scale: 1, duration: 0.2, ease: "power2.inOut" });
        });
      });

      // Badge hover
      const badge = root.querySelector<HTMLElement>(".why-badge");
      if (badge) {
        badge.addEventListener("mouseenter", () => gsap.to(badge, { scale: 1.05, duration: 0.2, ease: "back.out(2)" }));
        badge.addEventListener("mouseleave", () => gsap.to(badge, { scale: 1, duration: 0.2 }));
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="why">
      <div className="why-wrap">
        <div className="why-top">
          
          <h2 className="why-title">
            Why customers choose <br />
            <em>E RepairHub</em>
          </h2>
     
        </div>

        <div className="why-bottom">
          <div className="why-left">
            <div className="why-img-wrap">
              <img
                src="https://cdn.pixabay.com/photo/2024/02/24/19/00/phone-8594571_1280.jpg"
                alt="Repair technician at work"
              />
            </div>
            <div className="why-badge">
              <span className="why-badge-num">12,000+</span>
              <span className="why-badge-label">
                <span className="why-dot" />
                Devices repaired
              </span>
            </div>
          </div>

          <div className="why-right">
            <div className="why-cards">
              {features.map((f, i) => (
                <div className="why-card" key={i}>
                  <div className={`why-icon ${f.iconClass}`}>{f.icon}</div>
                  <div className="why-card-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                  <div className="why-card-arrow"><ArrowIcon /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}