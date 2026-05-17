import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Testimonials.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaQuoteRight, FaStar } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

type Stat = {
  to: number;
  decimals?: number;
  suffix?: string;
  label: string;
  format?: "compactInt" | "decimal";
};
type Review = { name: string; location: string; text: string; rating: number };

const STATS: Stat[] = [
  { to: 12000, suffix: "+", label: "Devices Repaired", format: "compactInt" },
  { to: 4.9, decimals: 1, suffix: "/5", label: "Avg. Rating", format: "decimal" },
  { to: 98, suffix: "%", label: "Same-Day Repair", format: "compactInt" },
  { to: 6, suffix: " Mo.", label: "Warranty", format: "compactInt" },
];

const REVIEWS: Review[] = [
  {
    name: "Priya S.",
    location: "Satellite, Ahmedabad",
    rating: 5,
    text: "Booked at 11 AM, repaired and back by 6 PM. Screen looks brand new.",
  },
  {
    name: "Rahul M.",
    location: "Bopal, Ahmedabad",
    rating: 5,
    text: "Pricing was exactly what they quoted. No surprises. Highly recommend.",
  },
  {
    name: "Aisha K.",
    location: "Maninagar, Ahmedabad",
    rating: 5,
    text: "The pickup guy was professional and the warranty card is a big plus.",
  },
  {
    name: "Vikram J.",
    location: "Naroda, Ahmedabad",
    rating: 5,
    text: "Way better than visiting a shop. Got my battery replaced same day.",
  },
  {
    name: "Neha P.",
    location: "Vastrapur, Ahmedabad",
    rating: 5,
    text: "Pickup was on time and the repair updates were super clear. Smooth experience.",
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [countStart, setCountStart] = useState(false);
  const [statValues, setStatValues] = useState<number[]>(() => STATS.map(() => 0));

  const starRow = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => <FaStar key={i} aria-hidden />);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tst-stat",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: "top 82%" },
        }
      );

      gsap.fromTo(
        ".tst-card",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.10,
          scrollTrigger: { trigger: sectionRef.current, start: "top 76%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setCountStart(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!countStart) return;

    const DURATION = 1100;
    const start = performance.now();
    const from = STATS.map(() => 0);
    const to = STATS.map((s) => s.to);

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);

      const next = to.map((target, i) => from[i] + (target - from[i]) * eased);
      setStatValues(next);

      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [countStart]);

  const formatStat = (s: Stat, n: number) => {
    if (s.format === "decimal") {
      const decimals = s.decimals ?? 0;
      return `${n.toFixed(decimals)}${s.suffix ?? ""}`;
    }
    const decimals = s.decimals ?? 0;
    const value = decimals > 0 ? Number(n.toFixed(decimals)) : Math.round(n);
    const formatted = new Intl.NumberFormat("en-IN").format(value);
    return `${formatted}${s.suffix ?? ""}`;
  };

  const marqueeReviews = useMemo(() => {
    // duplicate for seamless loop
    return [...REVIEWS, ...REVIEWS];
  }, []);

  return (
    <section className="tst" ref={sectionRef}>
      <div className="tst-inner">
        <header className="tst-head">
  
          <h2 className="tst-title">What customers say about us</h2>
          <p className="tst-sub">
            Real feedback from doorstep repairs and pickups across the city.
          </p>
        </header>

        <div className="tst-stats" aria-label="Service highlights">
          {STATS.map((s, idx) => (
            <div className="tst-stat" key={s.label}>
              <div className="tst-stat__value">{formatStat(s, statValues[idx] ?? 0)}</div>
              <div className="tst-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="tst-marquee" aria-label="Customer testimonials">
          <div className="tst-track">
            {marqueeReviews.map((r, i) => {
            const initial = r.name.trim().slice(0, 1).toUpperCase();
            return (
              <article className="tst-card" key={`${r.name}-${r.location}-${i}`}>
                <div className="tst-card__top">
                  <div className="tst-stars" aria-label={`${r.rating} out of 5`}>
                    {starRow}
                  </div>
                  <FaQuoteRight className="tst-quote" aria-hidden />
                </div>

                <p className="tst-text">“{r.text}”</p>

                <div className="tst-user">
                  <div className="tst-avatar" aria-hidden>
                    {initial}
                  </div>
                  <div className="tst-user__meta">
                    <div className="tst-user__name">{r.name}</div>
                    <div className="tst-user__loc">{r.location}</div>
                  </div>
                </div>
              </article>
            );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;