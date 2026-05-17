import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FiSmartphone,
  FiBatteryCharging,
  FiCamera,
  FiShield,
  FiSquare,
  FiPower,
  FiArrowRight,
} from "react-icons/fi";
import "./QuickQuote.css";

gsap.registerPlugin(ScrollTrigger);

type BrandTier = "premium" | "standard" | "budget";

type BrandOption = {
  id: string;
  name: string;
  tier: BrandTier;
};

type ServiceOption = {
  id: string;
  name: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  basePrice: number;
};

const BRANDS: BrandOption[] = [
  { id: "apple", name: "Apple", tier: "premium" },
  { id: "samsung", name: "Samsung", tier: "premium" },
  { id: "oneplus", name: "OnePlus", tier: "standard" },
  { id: "google", name: "Google", tier: "standard" },
  { id: "xiaomi", name: "Xiaomi", tier: "budget" },
  { id: "realme", name: "Realme", tier: "budget" },
  { id: "vivo", name: "Vivo", tier: "budget" },
  { id: "oppo", name: "Oppo", tier: "budget" },
  { id: "motorola", name: "Motorola", tier: "budget" },
  { id: "nothing", name: "Nothing", tier: "standard" },
];

const SERVICES: ServiceOption[] = [
  { id: "glass", name: "Screen Glass", Icon: FiSquare, basePrice: 499 },
  { id: "display", name: "Display", Icon: FiSmartphone, basePrice: 1499 },
  { id: "battery", name: "Battery", Icon: FiBatteryCharging, basePrice: 699 },
  { id: "charging", name: "Charging Port", Icon: FiPower, basePrice: 499 },
  { id: "camera", name: "Camera", Icon: FiCamera, basePrice: 399 },
  { id: "cover", name: "Mobile Cover", Icon: FiShield, basePrice: 299 },
];

const TIER_MULT: Record<BrandTier, number> = {
  premium: 1.35,
  standard: 1.15,
  budget: 1.0,
};

function formatINR(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function QuickQuote() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [brandId, setBrandId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [model, setModel] = useState<string>("");
  // Color step temporarily removed (will be part of order form later)

  const MODELS_BY_BRAND: Record<string, string[]> = {
    apple: ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 15 Pro"],
    samsung: ["Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S24", "Galaxy A54", "Galaxy M34"],
    oneplus: ["OnePlus 9", "OnePlus 10", "OnePlus 11", "OnePlus 12", "Nord 3", "Nord CE 4"],
    google: ["Pixel 6", "Pixel 7", "Pixel 8", "Pixel 8 Pro", "Pixel 9"],
    xiaomi: ["Redmi Note 12", "Redmi Note 13", "Mi 11X", "Xiaomi 13", "Xiaomi 14"],
    realme: ["Realme 10", "Realme 11", "Realme 12", "Narzo 60", "Narzo 70"],
    vivo: ["Vivo V27", "Vivo V29", "Vivo V30", "Vivo T2", "Vivo T3"],
    oppo: ["Oppo F21", "Oppo F23", "Oppo F25", "Reno 8", "Reno 11"],
    motorola: ["Moto G54", "Moto G64", "Moto Edge 40", "Moto Edge 50"],
    nothing: ["Nothing Phone (1)", "Nothing Phone (2)", "Nothing Phone (2a)"],
  };

  // const COLORS = ...
  // function colorToSwatch ...

  const selectedBrand = useMemo(
    () => BRANDS.find((b) => b.id === brandId) ?? null,
    [brandId]
  );
  const selectedService = useMemo(
    () => SERVICES.find((s) => s.id === serviceId) ?? null,
    [serviceId]
  );

  const step = useMemo(() => {
    if (!brandId) return "brand" as const;
    if (!serviceId) return "service" as const;
    if (!model) return "model" as const;
    return "price" as const;
  }, [brandId, serviceId, model]);

  const estimate = useMemo(() => {
    if (!selectedBrand || !selectedService || !model) return null;
    const mult = TIER_MULT[selectedBrand.tier];

    const modelMult =
      /ultra|max|pro/i.test(model) ? 1.18 : /plus/i.test(model) ? 1.1 : 1.0;

    const base = selectedService.basePrice * mult * modelMult;
    const low = base * 0.95;
    const high = base * 1.1;
    return { low, high };
  }, [selectedBrand, selectedService, model]);
useEffect(() => {
  const ctx = gsap.context(() => {

    // --- INITIAL STATE ---
    gsap.set(".qq-header", { opacity: 0, y: -50 });
    gsap.set(".qq-eyebrow", { opacity: 0, scaleX: 0 });
    gsap.set(".qq-title", { opacity: 0, y: 40 });
    gsap.set(".qq-sub", { opacity: 0, y: 20 });
    gsap.set(".qq-shell__left", { opacity: 0, x: -80 });
    gsap.set(".qq-shell__right", { opacity: 0, x: 80 });
    gsap.set(".qq-sum", { opacity: 0, x: -30 });
    gsap.set(".qq-bg", { scaleX: 0, transformOrigin: "left center" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 78%",
        once: true,
      },
    });

    // 1. BG wipe left to right
    tl.to(".qq-bg", {
      scaleX: 1,
      duration: 0.7,
      ease: "power3.inOut",
    })

    // 2. Header wrapper fades in (required so title/sub become visible)
    .to(".qq-header", {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: "power3.out",
    }, "-=0.45")

    // 3. Eyebrow pill scales in
    .to(".qq-eyebrow", {
      opacity: 1,
      scaleX: 1,
      duration: 0.45,
      ease: "back.out(2)",
    }, "-=0.3")

    // 4. Title rises
    .to(".qq-title", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    }, "-=0.2")

    // 5. Subtitle fades
    .to(".qq-sub", {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "-=0.35")

    // 6. Left panel slides from left, right panel from right — simultaneously
    .to(".qq-shell__left", {
      opacity: 1,
      x: 0,
      duration: 0.65,
      ease: "power3.out",
    }, "-=0.2")

    .to(".qq-shell__right", {
      opacity: 1,
      x: 0,
      duration: 0.65,
      ease: "power3.out",
    }, "<") // "<" means same time as above

    // 7. Left side summary buttons stagger in
    .to(".qq-sum", {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: "back.out(1.4)",
      stagger: 0.1,
    }, "-=0.3");

    // --- HOVER MICRO on qq-sum buttons ---
    document.querySelectorAll(".qq-sum").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        gsap.to(el, { x: 5, duration: 0.2, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, duration: 0.2, ease: "power2.out" });
      });
    });

    // --- PANEL CHANGE animation (runs on step change via class toggle) ---
    // Watches for .is-on class additions and animates the active panel
    const observer = new MutationObserver(() => {
      // GSAP writes inline opacity/transform; clear them on inactive panels
      // so only the active `.qq-panel.is-on` is visible and nothing overlaps.
      document.querySelectorAll(".qq-panel").forEach((panel) => {
        if (!panel.classList.contains("is-on")) {
          gsap.set(panel, { clearProps: "opacity,transform" });
        }
      });

      const activePanel = document.querySelector(".qq-panel.is-on");
      if (activePanel) {
        gsap.fromTo(
          activePanel,
          { opacity: 0, y: 22, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          }
        );

        // Pills inside panel stagger in
        const pills = activePanel.querySelectorAll(".qq-pill, .qq-svc");
        if (pills.length) {
          gsap.fromTo(
            pills,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
              stagger: 0.045,
            }
          );
        }
      }
    });

    const shell = document.querySelector(".qq-shell__right");
    if (shell) {
      observer.observe(shell, { subtree: true, attributes: true, attributeFilter: ["class"] });
    }

    // --- PRICE CARD special entrance ---
    const priceObserver = new MutationObserver(() => {
      const pricePanel = document.querySelector(".qq-panel.is-on");
      if (pricePanel?.querySelector(".qq-priceCard")) {
        gsap.fromTo(".qq-price", 
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", delay: 0.2 }
        );
        gsap.fromTo(".qq-result-row",
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", stagger: 0.08, delay: 0.35 }
        );
        gsap.fromTo(".qq-cta",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)", delay: 0.65 }
        );
      }
    });

    if (shell) {
      priceObserver.observe(shell, { subtree: true, attributes: true, attributeFilter: ["class"] });
    }

    return () => {
      observer.disconnect();
      priceObserver.disconnect();
    };

  }, sectionRef);

  return () => ctx.revert();
}, []);
  return (
    <section className="qq" ref={sectionRef}>
      <div className="qq-bg" aria-hidden />

      <div className="qq-header">
   
        <h2 className="qq-title">
          Select your <em>Brand</em>, <em>Model</em> &amp; <em>Service</em>
        </h2>
      </div>

      <div className="qq-shell">
        <div className={`qq-shell__left ${brandId ? "is-filled" : ""}`}>
          <p className="qq-shell__title">Your selection</p>

          <button
            type="button"
            className={`qq-sum ${brandId ? "is-on" : ""}`}
            onClick={() => {
              setBrandId("");
              setServiceId("");
              setModel("");
            }}
          >
            <span className="qq-sum__k">Brand</span>
            <span className="qq-sum__v">{selectedBrand?.name ?? "Choose brand"}</span>
          </button>

          <button
            type="button"
            className={`qq-sum ${serviceId ? "is-on" : ""}`}
            disabled={!brandId}
            onClick={() => {
              setServiceId("");
              setModel("");
            }}
            title={!brandId ? "Select brand first" : undefined}
          >
            <span className="qq-sum__k">Service</span>
            <span className="qq-sum__v">{selectedService?.name ?? "Choose service"}</span>
          </button>

          <button
            type="button"
            className={`qq-sum ${model ? "is-on" : ""}`}
            disabled={!brandId || !serviceId}
            onClick={() => {
              setModel("");
            }}
            title={!brandId ? "Select brand first" : !serviceId ? "Select service first" : undefined}
          >
            <span className="qq-sum__k">Model</span>
            <span className="qq-sum__v">{model || "Choose model"}</span>
          </button>

          {/* overall price shown on right side only */}
        </div>

        <div className={`qq-shell__right ${step === "price" ? "is-price" : ""}`}>
          <div className={`qq-panel ${step === "brand" ? "is-on" : ""}`}>
            <h3 className="qq-panel__title">Choose Brand</h3>
            <p className="qq-panel__sub">Pick a brand to continue.</p>
            <div className="qq-pills" role="list">
              {BRANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`qq-pill${brandId === b.id ? " is-on" : ""}`}
                  onClick={() => setBrandId(b.id)}
                >
                  <span className="qq-pill-dot" aria-hidden />
                  <span className="qq-pill-text">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`qq-panel ${step === "service" ? "is-on" : ""}`}>
            <h3 className="qq-panel__title">Choose Service</h3>
            <p className="qq-panel__sub">Now select the repair service.</p>
            <div className="qq-services" role="list">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`qq-svc${serviceId === s.id ? " is-on" : ""}`}
                  onClick={() => setServiceId(s.id)}
                  disabled={!brandId}
                  title={!brandId ? "Select brand first" : undefined}
                >
                  <span className="qq-svc-ico" aria-hidden>
                    <s.Icon />
                  </span>
                  <span className="qq-svc-text">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`qq-panel ${step === "model" ? "is-on" : ""}`}>
            <h3 className="qq-panel__title">Choose Model</h3>
            <p className="qq-panel__sub">Model selection refines estimate.</p>
            <div className="qq-pills qq-pills--models" role="list">
              {(MODELS_BY_BRAND[brandId] ?? []).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`qq-pill${model === m ? " is-on" : ""}`}
                  onClick={() => setModel(m)}
                >
                  <span className="qq-pill-text">{m}</span>
                </button>
              ))}
            </div>
          </div>


          <div className={`qq-panel qq-panel--price ${step === "price" ? "is-on" : ""}`}>
            <h3 className="qq-panel__title">Your Estimate</h3>
            <p className="qq-panel__sub">Based on your selections.</p>
            <div className="qq-priceCard">
              <div className="qq-priceCard__top">
                <span className="qq-price-eyebrow">Estimated Price</span>
                <div className="qq-price">
                  {estimate ? `${formatINR(estimate.low)} – ${formatINR(estimate.high)}` : "—"}
                </div>
              </div>
              <div className="qq-priceCard__facts">
                <div className="qq-result-row">
                  <span className="qq-label">Brand</span>
                  <span className="qq-value">{selectedBrand?.name}</span>
                </div>
                <div className="qq-result-row">
                  <span className="qq-label">Service</span>
                  <span className="qq-value">{selectedService?.name}</span>
                </div>
                <div className="qq-result-row">
                  <span className="qq-label">Model</span>
                  <span className="qq-value">{model}</span>
                </div>
              </div>
             
              <button type="button" className="qq-cta">
                Continue to Booking <FiArrowRight aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

