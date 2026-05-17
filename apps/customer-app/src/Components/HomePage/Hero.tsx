import React, { useEffect, useRef } from "react";
import "./Hero.css";
import OfferSlide from "./OfferSlide";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero3D = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // --- INITIAL HIDDEN STATE ---
      gsap.set(".hero-eyebrow", { opacity: 0, y: -20 });
      gsap.set(".word", { y: "110%" });
      gsap.set(".hero-para", { opacity: 0, y: 30 });
      gsap.set(".hero-buttons", { opacity: 0, y: 24 });
      gsap.set(".trust-row", { opacity: 0, y: 20 });
      gsap.set(".hero-rightPoster", { opacity: 0, x: 60 });

      // --- ENTRANCE TIMELINE ---
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.55 }, 0.2)
        .to(".word", { y: "0%", duration: 0.7, stagger: 0.07, ease: "power4.out" }, 0.4)
        .to(".hero-para", { opacity: 1, y: 0, duration: 0.6 }, 0.85)
        .to(".hero-buttons", { opacity: 1, y: 0, duration: 0.5 }, 1.05)
        .to(".trust-row", { opacity: 1, y: 0, duration: 0.45 }, 1.2)
        .to(".hero-rightPoster", { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }, 0.65);

      // --- FLOATING POSTER ---
      gsap.to(".hero-rightPoster", {
        y: -10,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });

      // --- PARALLAX ON SCROLL ---
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

      gsap.to(".hero-rightPoster", {
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

      {/* LEFT CONTENT */}
      <div className="hero-left">

        {/* Eyebrow badge */}
   

        {/* Heading — wrap each word for animation */}
        <h2>
          {["Repair", "Your", "Phone,"].map((w) => (
            <span className="word-wrap" key={w}>
              <span className="word">{w} </span>
            </span>
          ))}
          <br />
          <span className="highlight">
            {["The", "Smart", "Way"].map((w) => (
              <span className="word-wrap" key={w}>
                <span className="word">{w} </span>
              </span>
            ))}
          </span>
        </h2>

        {/* Paragraph */}
        <p className="hero-para">
          Book your mobile repair in just a few clicks. Our delivery partner picks up your
          device from your doorstep, gets it repaired by certified experts, and delivers
          it back safely — saving your time and effort.
        </p>

        {/* Buttons */}
        <div className="hero-buttons">
          <button className="btn-primary">Repair Request →</button>
          <button className="btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            How it works
          </button>
        </div>

      
      </div>

      {/* RIGHT POSTER SLIDER */}
      <div className="hero-rightPoster">
        <OfferSlide />
      </div>

    </section>
  );
};

export default Hero3D;