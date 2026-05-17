import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiCheck, FiX } from "react-icons/fi";
import "./Comparison.css";

gsap.registerPlugin(ScrollTrigger);

export default function Comparison() {
  const sectionRef = useRef<HTMLElement | null>(null);

// useEffect ke andar replace kar:
useEffect(() => {
  const root = sectionRef.current;
  if (!root) return;

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: "top 75%" }
    });

    // Head fade-in
    gsap.set(".cmp-head", { opacity: 0, y: 24 });
    gsap.set(".cmp-card", { opacity: 0, scaleY: 0.88, transformOrigin: "top center" });
    gsap.set(".cmp-row", { opacity: 0, x: -18 });

    tl.to(".cmp-head", { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" })
      .to(".cmp-card", { opacity: 1, scaleY: 1, duration: 0.55, ease: "power3.out" }, "-=0.3")
      .to(".cmp-row", { opacity: 1, x: 0, duration: 0.45, stagger: 0.07, ease: "power3.out" }, "-=0.25");

    // Brand column shimmer loop
    tl.add(() => {
      gsap.to(".shimmer-line", {
        left: "150%",
        duration: 0.9,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 2.5
      });
    }, "+=0.3");

    // Check icons pop-in
    gsap.utils.toArray<Element>(".cmp-ico--good").forEach((ico, i) => {
      gsap.from(ico, {
        scale: 0,
        rotation: -30,
        duration: 0.4,
        ease: "back.out(2)",
        delay: 0.9 + i * 0.07,
        scrollTrigger: { trigger: root, start: "top 75%" }
      });
    });

    // Row hover micro-interactions
    root.querySelectorAll<HTMLElement>(".cmp-row:not(.cmp-row--head)").forEach(row => {
      row.addEventListener("mouseenter", () => {
        gsap.to(row, { backgroundColor: "rgba(29,158,117,0.04)", duration: 0.2 });
        const feat = row.querySelector<HTMLElement>(".cmp-cell--feat");
        if (feat) gsap.to(feat, { x: 5, duration: 0.2 });
      });
      row.addEventListener("mouseleave", () => {
        gsap.to(row, { backgroundColor: "transparent", duration: 0.25 });
        const feat = row.querySelector<HTMLElement>(".cmp-cell--feat");
        if (feat) gsap.to(feat, { x: 0, duration: 0.2 });
      });
    });

  }, root);

  return () => ctx.revert();
}, []);

  return (
    <section ref={sectionRef} className="cmp">
      <div className="cmp-head">
        
        <h2 className="cmp-title">
          Why E RepairHub Beats <br />
          <span>Traditional Shops</span>
        </h2>
      </div>

      <div className="cmp-card" role="table" aria-label="Comparison table">
        <div className="cmp-row cmp-row--head" role="row">
          <div className="cmp-cell cmp-cell--h" role="columnheader">
            FEATURE
          </div>
          <div className="cmp-cell cmp-cell--h" role="columnheader">
            LOCAL SHOP
          </div>
          <div className="cmp-cell cmp-cell--h cmp-cell--brand" role="columnheader">
            E REPAIRHUB
          </div>
        </div>

        <div className="cmp-row" role="row">
          <div className="cmp-cell cmp-cell--feat" role="cell">
            Visit Required
          </div>
          <div className="cmp-cell" role="cell">
            Yes
          </div>
          <div className="cmp-cell cmp-cell--good" role="cell">
            No
          </div>
        </div>

        <div className="cmp-row" role="row">
          <div className="cmp-cell cmp-cell--feat" role="cell">
            Price Transparency
          </div>
          <div className="cmp-cell" role="cell">
            <span className="cmp-ico cmp-ico--bad" aria-label="No">
              <FiX aria-hidden />
            </span>
          </div>
          <div className="cmp-cell" role="cell">
            <span className="cmp-ico cmp-ico--good" aria-label="Yes">
              <FiCheck aria-hidden />
            </span>
          </div>
        </div>

        <div className="cmp-row" role="row">
          <div className="cmp-cell cmp-cell--feat" role="cell">
            Time Wasted
          </div>
          <div className="cmp-cell" role="cell">
            High
          </div>
          <div className="cmp-cell cmp-cell--good" role="cell">
            Minimal
          </div>
        </div>

        <div className="cmp-row" role="row">
          <div className="cmp-cell cmp-cell--feat" role="cell">
            Pickup &amp; Delivery
          </div>
          <div className="cmp-cell" role="cell">
            <span className="cmp-ico cmp-ico--bad" aria-label="No">
              <FiX aria-hidden />
            </span>
          </div>
          <div className="cmp-cell" role="cell">
            <span className="cmp-ico cmp-ico--good" aria-label="Yes">
              <FiCheck aria-hidden />
            </span>
          </div>
        </div>

        <div className="cmp-row" role="row">
          <div className="cmp-cell cmp-cell--feat" role="cell">
            Warranty
          </div>
          <div className="cmp-cell" role="cell">
            Limited
          </div>
          <div className="cmp-cell cmp-cell--good" role="cell">
            6 Months
          </div>
        </div>
      </div>
    </section>
  );
}

