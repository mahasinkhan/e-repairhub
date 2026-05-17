import React, { useEffect, useRef } from "react";
import "./HowItWorks.css";
import { FiPackage, FiSmartphone, FiTool, FiTruck, FiCheckCircle } from "react-icons/fi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "1",
    Icon: FiSmartphone,
    title: "Select Device & Service",
    desc: "Choose your phone brand and the type of repair you need in just a few taps.",
  },
  {
    num: "2",
    Icon: FiTruck,
    title: "Book Pickup",
    desc: "Schedule a convenient pickup time and our partner will arrive at your doorstep.",
  },
  {
    num: "3",
    Icon: FiTool,
    title: "Repair at Shop",
    desc: "Certified technicians fix your device with genuine parts and quality checks.",
  },
  {
    num: "4",
    Icon: FiPackage,
    title: "Delivered Back",
    desc: "Your repaired phone is safely delivered back to you, good as new.",
  },
  {
    num: "5",
    Icon: FiCheckCircle,
    title: "Track & Confirm",
    desc: "Track your order status and confirm once you’ve received your device.",
  },
];

const HowItWorks = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
  const ctx = gsap.context(() => {

    // --- INITIAL HIDDEN STATE ---
    gsap.set(".hiw-header-wrap", { opacity: 0, y: -40 });
    gsap.set(".hiw-card:nth-child(1)", { opacity: 0, x: -120 });
    gsap.set(".hiw-card:nth-child(2)", { opacity: 0, x: -120 });
    gsap.set(".hiw-card:nth-child(3)", { opacity: 0, x: 120 });
    gsap.set(".hiw-card:nth-child(4)", { opacity: 0, x: 120 });
    gsap.set(".hiw-card:nth-child(5)", { opacity: 0, x: 120 });
    gsap.set(".hiw-step-num", { scale: 0 });
    gsap.set(".hiw-icon", { scale: 0, opacity: 0 });
    gsap.set(".hiw-arrow", { opacity: 0, x: -10 });
    gsap.set(".hiw-cta", { opacity: 0, y: 30 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
      },
    });

    // 1. Header
    tl.to(".hiw-header-wrap", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    })

    // 2. Card 1 & 2 — left se aayenge simultaneously
    .to(".hiw-card:nth-child(1), .hiw-card:nth-child(2)", {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.12,
    }, "-=0.1")

    // 3. Card 3 & 4 — right se aayenge simultaneously
    .to(".hiw-card:nth-child(3), .hiw-card:nth-child(4), .hiw-card:nth-child(5)", {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.12,
    }, "-=0.5")

    // 4. Step numbers bounce
    .to(".hiw-step-num", {
      scale: 1,
      duration: 0.4,
      ease: "back.out(2)",
      stagger: 0.1,
    }, "-=0.5")

    // 5. Icons pop
    .to(".hiw-icon", {
      scale: 1,
      opacity: 1,
      duration: 0.35,
      ease: "back.out(2.5)",
      stagger: 0.1,
    }, "-=0.4")

    // 6. Arrows slide in
    .to(".hiw-arrow", {
      opacity: 1,
      x: 0,
      duration: 0.3,
      ease: "power2.out",
      stagger: 0.1,
    }, "-=0.3")

    // 7. CTA
    .to(".hiw-cta", {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "-=0.2");

  }, sectionRef);

  return () => ctx.revert();
}, []);
  return (
    <section className="hiw-section" ref={sectionRef}>

      {/* Header */}
      <div className="hiw-header-wrap">
        <h2 className="hiw-title">How It Works</h2>
        <p className="hiw-sub">Simple 5-step process to get your device repaired — hassle free.</p>
      </div>

      {/* Step Cards */}
      <div className="hiw-cards">
        {steps.map((item, index) => (
          <div className="hiw-card" key={index}>

            {/* Step number */}
            <div className="hiw-step-num">{item.num}</div>

            {/* Icon */}
            <div className="hiw-icon" aria-hidden="true">
              <item.Icon />
            </div>

            <h3>{item.title}</h3>
            <p>{item.desc}</p>

            {/* Arrow connector (hidden on last card via CSS) */}
            <div className="hiw-arrow">›</div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="hiw-cta">
        <button className="hiw-cta-btn">Book a Repair →</button>
      </div>

    </section>
  );
};

export default HowItWorks;
