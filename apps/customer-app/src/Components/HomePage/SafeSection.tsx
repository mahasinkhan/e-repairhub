import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./SafeSection.css";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    cls: "ic-blue",
    title: "Data protection",
    desc: "Your personal data is never accessed or stored during repairs.",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    cls: "ic-violet",
    title: "User privacy",
    desc: "All customer information is encrypted and never shared.",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  },
  {
    cls: "ic-teal",
    title: "Real-time tracking",
    desc: "Monitor your device's repair journey at every step.",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    cls: "ic-green",
    title: "Certified centers",
    desc: "Only verified, audited repair hubs handle your device.",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
];

export default function SafeSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const st = { trigger: root, start: "top 72%" };

      gsap.set(".safe-eyebrow", { opacity: 0, y: 12 });
      gsap.set(".safe-title",   { opacity: 0, y: 18 });
      gsap.set(".safe-subtitle",{ opacity: 0, y: 12 });
      gsap.set(".safe-circle",  { opacity: 0, scale: 0.9, rotateY: -18 });
      gsap.set(".safe-card",    { opacity: 0, y: 22 });
      gsap.set(".safe-trust",   { opacity: 0, y: 10 });

      gsap.timeline({ scrollTrigger: st })
        .to(".safe-eyebrow",  { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" })
        .to(".safe-title",    { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, "-=0.25")
        .to(".safe-subtitle", { opacity: 1, y: 0, duration: 0.40, ease: "power3.out" }, "-=0.30")
        .to(".safe-circle",   { opacity: 1, scale: 1, rotateY: -10, duration: 0.85, ease: "power3.out" }, "-=0.2")
        .to(".safe-card",     { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" }, "-=0.55")
        .to(".safe-trust",    { opacity: 1, y: 0, duration: 0.40, ease: "power3.out" }, "-=0.15");

      const circle = root.querySelector<HTMLElement>(".safe-circle");
      if (circle) {
        circle.addEventListener("mouseenter", () =>
          gsap.to(circle, { scale: 1.05, rotateY: 0, rotateX: 0, duration: 0.5, ease: "power2.out" })
        );
        circle.addEventListener("mouseleave", () =>
          gsap.to(circle, { scale: 1, rotateY: -10, rotateX: 4, duration: 0.55, ease: "power2.inOut" })
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="safe-section" ref={sectionRef} className="safe">
      <div className="safe-head">
       
        <h2 className="safe-title">Your device is in <em>safe hands</em></h2>
        <p className="safe-subtitle">
          Every repair is handled with end-to-end security — from your data to your doorstep.
        </p>
      </div>

      <div className="safe-wrap">
        <div className="safe-right">
          {cards.map((c, i) => (
            <div className="safe-card" key={i}>
              <div className={`safe-card-icon ${c.cls}`}>{c.icon}</div>
              <div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </div>
          ))}
          <div className="safe-trust" style={{ gridColumn: "1 / -1" }}>
            <div className="safe-trust-dot" />
            <span>All repairs are insured &amp; covered under a 6-month warranty</span>
          </div>
        </div>

        <div className="safe-left">
          <div className="safe-circle">
            <img
              src="https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=700&q=80"
              alt="Secure device repair"
            />
          </div>
        </div>
      </div>
    </section>
  );
}