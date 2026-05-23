import React, { useEffect, useRef } from "react";
import "./Hero.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FiAward,
  FiCheckCircle,
  FiClock,
  FiPlayCircle,
  FiShield,
  FiStar,
  FiTruck,
  FiUserCheck,
} from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const trustItems = [
  { icon: <FiStar />, title: "4.9 Rating", subtitle: "12K+ Reviews" },
  { icon: <FiClock />, title: "Same Day Repair", subtitle: "Express Service" },
  { icon: <FiShield />, title: "6 Month Warranty", subtitle: "On All Repairs" },
  { icon: <FiCheckCircle />, title: "Secure & Safe", subtitle: "100% Protected" },
];

const featureCards = [
  { icon: <FiTruck />, title: "Free Pickup", subtitle: "& Delivery" },
  { icon: <FiShield />, title: "Genuine Parts", subtitle: "Assured" },
  { icon: <FiUserCheck />, title: "Certified", subtitle: "Technicians" },
];

const Hero3D = () => {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero-eyebrow", { opacity: 0, y: -20 });
      gsap.set(".word", { y: "110%" });
      gsap.set(".hero-para", { opacity: 0, y: 30 });
      gsap.set(".hero-buttons", { opacity: 0, y: 24 });
      gsap.set(".trust-row", { opacity: 0, y: 20 });
      gsap.set(".hero-visual", { opacity: 0, x: 60 });
      gsap.set(".hero-feature-card", { opacity: 0, x: 28 });
      gsap.set(".hero-rating-card", { opacity: 0, scale: 0.9 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.55 }, 0.2)
        .to(".word", { y: "0%", duration: 0.7, stagger: 0.07, ease: "power4.out" }, 0.4)
        .to(".hero-para", { opacity: 1, y: 0, duration: 0.6 }, 0.85)
        .to(".hero-buttons", { opacity: 1, y: 0, duration: 0.5 }, 1.05)
        .to(".trust-row", { opacity: 1, y: 0, duration: 0.45 }, 1.2)
        .to(".hero-visual", { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }, 0.65)
        .to(".hero-feature-card", { opacity: 1, x: 0, duration: 0.42, stagger: 0.12 }, 1.05)
        .to(".hero-rating-card", { opacity: 1, scale: 1, duration: 0.42 }, 1.35);

      gsap.to(".hero-phone-wrap", {
        y: -10,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });

      gsap.to(".hero-left", {
        y: 40,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero3d",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(".hero-visual", {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero3d",
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero3d" ref={heroRef}>
      <div className="hero-left">
        <div className="hero-eyebrow">
          <FiAward />
          India's Most Trusted Repair Service
        </div>

        <h2>
          {["Premium", "Smartphone"].map((word) => (
            <span className="word-wrap" key={word}>
              <span className="word">{word} </span>
            </span>
          ))}
          <br />
          <span className="highlight">
            {["Repair", "At", "Your", "Doorstep"].map((word) => (
              <span className="word-wrap" key={word}>
                <span className="word">{word} </span>
              </span>
            ))}
          </span>
        </h2>

        <p className="hero-para">
          Book a repair in seconds. Our certified experts will pick up your device,
          repair it with genuine parts and deliver it back safe, fast and hassle free.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary">
            Book a Repair <span>→</span>
          </button>
          <button className="btn-secondary">
            <FiPlayCircle />
            How It Works
          </button>
        </div>

        <div className="trust-row">
          {trustItems.map((item) => (
            <div className="trust-item" key={item.title}>
              <span className="trust-icon">{item.icon}</span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-phone-wrap">
          <div className="phone-orbit" />
          <div className="phone-device">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="phone-glow phone-glow-one" />
              <div className="phone-glow phone-glow-two" />
              <div className="phone-mark">ER</div>
            </div>
          </div>
        </div>

        <div className="hero-feature-stack">
          {featureCards.map((card) => (
            <div className="hero-feature-card" key={card.title}>
              <span>{card.icon}</span>
              <strong>
                {card.title}
                <small>{card.subtitle}</small>
              </strong>
            </div>
          ))}
        </div>

        <div className="hero-rating-card">
          <strong>4.9</strong>
          <span>★★★★★</span>
          <small>10K+ verified</small>
        </div>
      </div>
    </section>
  );
};

export default Hero3D;
