import React, { useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiGift,
  FiPackage,
  FiPlus,
  FiTool,
  FiTruck,
  FiZap,
} from "react-icons/fi";
import "./Track.css";

/* ─── Types ──────────────────────────────────────────────────── */
type LatestOrder = {
  id: string;
  createdAt: string;
  brand: string | null;
  service: { id: string; name: string };
  payment?: { method: "cod" | "upi" | string; label?: string };
  charges: {
    base: number;
    tierFee: number;
    subtotal: number;
    deliveryCharge: number;
    total: number;
  };
  schedule: { date: string; time: string };
  customer: { name: string; phone: string; address: string };
  statusIndex: number;
};

const STEPS: { label: string; Icon: IconType; sub: string }[] = [
  { label: "Booked", Icon: FiClipboard, sub: "Today" },
  { label: "Pickup Scheduled", Icon: FiTruck, sub: "Tomorrow" },
  { label: "In Repair", Icon: FiTool, sub: "" },
  { label: "Out for Delivery", Icon: FiPackage, sub: "" },
  { label: "Delivered", Icon: FiCheckCircle, sub: "" },
];

function safeParseLatestOrder(): LatestOrder | null {
  try {
    const raw = localStorage.getItem("erepairhub.latestOrder");
    if (!raw) return null;
    return JSON.parse(raw) as LatestOrder;
  } catch { return null; }
}

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/* ─── GSAP loader ─────────────────────────────────────────────── */
function loadGSAP(): Promise<{ gsap: any; ScrollTrigger: any }> {
  return new Promise((resolve) => {
    if ((window as any).gsap && (window as any).ScrollTrigger) {
      resolve({ gsap: (window as any).gsap, ScrollTrigger: (window as any).ScrollTrigger });
      return;
    }
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
      s2.onload = () => {
        const g = (window as any).gsap;
        const ST = (window as any).ScrollTrigger;
        g.registerPlugin(ST);
        resolve({ gsap: g, ScrollTrigger: ST });
      };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });
}

/* ─── Component ───────────────────────────────────────────────── */
const Track: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get("order");

  const order = useMemo(() => safeParseLatestOrder(), []);
  const canShow = !!order && (!orderParam || order.id === orderParam);

  const pageRef   = useRef<HTMLDivElement>(null);
  const fillRef   = useRef<HTMLDivElement>(null);

  const activeIdx = canShow
    ? Math.min(Math.max(order!.statusIndex ?? 0, 0), STEPS.length - 1)
    : 0;

  // rail fill %: active node center relative to the rail width
  // rail starts at 10% and ends at 90% of full width (see CSS ::before)
  const railPct = STEPS.length <= 1 ? 0 : (activeIdx / (STEPS.length - 1)) * 100;

  /* ─── GSAP ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!canShow) return;

    loadGSAP().then(({ gsap, ScrollTrigger }) => {
      const ctx = gsap.context(() => {

        // eyebrow
        gsap.to(".track-eyebrow", {
          opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.15,
        });

        // big title
        gsap.fromTo(
          ".track-hero-title",
          { opacity: 0, y: 36, skewX: -2 },
          { opacity: 1, y: 0, skewX: 0, duration: 0.85, ease: "power3.out", delay: 0.28 }
        );

        // meta pills
        gsap.to(".track-hero-meta-row", {
          opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.44,
        });

        // tracker section slide in
        gsap.to(".track-tracker-section", {
          opacity: 1, duration: 0.65, ease: "power3.out", delay: 0.58,
        });

        // nodes pop in staggered
        gsap.fromTo(
          ".track-tracker-node",
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.1, duration: 0.45, ease: "back.out(2)", delay: 0.72 }
        );

        // fill bar animate
        if (fillRef.current) {
          gsap.to(fillRef.current, {
            width: `${railPct}%`,
            duration: 1.5,
            ease: "power2.out",
            delay: 0.88,
          });
        }

        // delivery banner
        gsap.to(".track-delivery", {
          opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 1.05,
        });

        // sections on scroll
        (gsap.utils.toArray(".track-section") as HTMLElement[]).forEach((el, i) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 87%",
            onEnter: () => {
              gsap.to(el, {
                opacity: 1, y: 0,
                duration: 0.65,
                delay: i * 0.08,
                ease: "power3.out",
              });
            },
          });
        });

        // status tiles stagger on scroll
        ScrollTrigger.create({
          trigger: ".track-status-list",
          start: "top 88%",
          onEnter: () => {
            gsap.fromTo(
              ".track-status-item",
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, stagger: 0.07, duration: 0.45, ease: "power3.out" }
            );
          },
        });

        // action row
        ScrollTrigger.create({
          trigger: ".track-action-row",
          start: "top 92%",
          onEnter: () => {
            gsap.to(".track-action-row", {
              opacity: 1, duration: 0.55, ease: "power3.out",
            });
          },
        });

        // FAB bounce in
        gsap.to(".track-fab", {
          opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.6)", delay: 1.4,
        });

      }, pageRef);

      return () => ctx.revert();
    });
  }, [canShow, railPct]);

  /* ─── Empty state ─────────────────────────────────────────────── */
  if (!canShow) {
    return (
      <div className="track-page" ref={pageRef}>
        <div className="track-empty">
          <span className="track-empty-icon" aria-hidden>
            <FiPackage />
          </span>
          <h1 className="track-empty-title">No order found</h1>
          <p className="track-empty-sub">
            Please place a booking first. After booking, your tracking status will appear here.
          </p>
          <Link className="track-btn track-btn--primary track-btn--with-icon" to="/">
            <FiArrowLeft aria-hidden />
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  const created = new Date(order!.createdAt);
  const createdStr = Number.isNaN(created.getTime())
    ? "—"
    : created.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const currentStep = STEPS[activeIdx];
  const deliveryFree = (order!.charges?.deliveryCharge ?? 0) === 0;

  return (
    <div className="track-page" ref={pageRef}>

      {/* ══ HERO ══ */}
      <div className="track-hero">
        <p className="track-eyebrow">
          <span className="track-eyebrow-dot" />
          Order tracking
        </p>

        <h1 className="track-hero-title">
          Your repair is <em>{currentStep.label.toLowerCase()}</em>
        </h1>

        <div className="track-hero-meta-row">
          <span className="track-pill">
            Order ID&nbsp;<strong>{order!.id}</strong>
          </span>
          <span className="track-pill">
            Placed on&nbsp;<strong>{createdStr}</strong>
          </span>
          <span className="track-pill track-pill--status">
            <span className="track-pill-dot" />
            <currentStep.Icon className="track-pill-step-icon" aria-hidden />
            {currentStep.label}
          </span>
        </div>
      </div>

      {/* ══ TRACKER — full width, single ══ */}
      <div className="track-tracker-section">
        <div className="track-tracker">
          <div className="track-tracker-fill" ref={fillRef} />
          {STEPS.map((s, i) => {
            const state = i < activeIdx ? "is-done" : i === activeIdx ? "is-active" : "";
            return (
              <div key={s.label} className={`track-tracker-step ${state}`}>
                <div className="track-tracker-node">
                  {i < activeIdx ? (
                    <FiCheck className="track-tracker-node-icon" strokeWidth={3} aria-hidden />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span className="track-tracker-label">{s.label}</span>
                {i === activeIdx && s.sub && (
                  <span className="track-tracker-sub">{s.sub}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Delivery banner — attached below tracker */}
        <div className="track-delivery">
          <div>
            <div className="track-delivery-label">Estimated delivery</div>
            <div className="track-delivery-val">
              {order!.schedule?.date ?? "—"} · {order!.schedule?.time ?? "—"}
            </div>
          </div>
          <span className="track-chip track-chip--blue">On track</span>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="track-body">

        {/* ── Status tiles section ── */}
        <div className="track-section">
          <div className="track-section-head">
            <h2 className="track-section-title">Repair status</h2>
            <span className="track-section-badge">Step {activeIdx + 1} of {STEPS.length}</span>
          </div>
          <div className="track-status-list">
            {STEPS.map((s, i) => {
              const state = i < activeIdx ? "is-done" : i === activeIdx ? "is-active" : "";
              return (
                <div key={s.label} className={`track-status-item ${state}`}>
                  <s.Icon className="track-status-icon" aria-hidden />
                  <div className="track-status-name">{s.label}</div>
                  {i === activeIdx && (
                    <span className="track-status-tag">
                      <FiZap className="track-status-tag-icon" aria-hidden />
                      Current
                    </span>
                  )}
                  {i < activeIdx && (
                    <span className="track-status-done-tag">
                      <FiCheck className="track-status-done-icon" aria-hidden />
                      Done
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Order details section ── */}
        <div className="track-section">
          <div className="track-section-head">
            <h2 className="track-section-title">Order details</h2>
          </div>
          <div className="track-details-grid">
            <div className="track-detail-cell">
              <div className="track-detail-k">Brand</div>
              <div className="track-detail-v">{order!.brand ?? "—"}</div>
            </div>
            <div className="track-detail-cell">
              <div className="track-detail-k">Service</div>
              <div className="track-detail-v">{order!.service?.name ?? "—"}</div>
            </div>
            <div className="track-detail-cell">
              <div className="track-detail-k">Schedule</div>
              <div className="track-detail-v">
                {order!.schedule?.date ?? "—"}
                <div className="track-detail-v-sub">{order!.schedule?.time ?? "—"}</div>
              </div>
            </div>
            <div className="track-detail-cell">
              <div className="track-detail-k">Payment</div>
              <div className="track-detail-v">
                {order!.payment?.label ?? "—"}
                <div className="track-detail-v-sub">
                  <span className="track-chip track-chip--green track-chip--compact">
                    <FiCheck className="track-chip-icon" strokeWidth={3} aria-hidden />
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
            <div className="track-detail-cell">
              <div className="track-detail-k">Customer</div>
              <div className="track-detail-v">
                {order!.customer?.name ?? "—"}
                <div className="track-detail-v-sub">{order!.customer?.phone ?? "—"}</div>
              </div>
            </div>
            <div className="track-detail-cell">
              <div className="track-detail-k">Address</div>
              <div className="track-detail-v">{order!.customer?.address ?? "—"}</div>
            </div>
          </div>
        </div>

        {/* ── Billing section ── */}
        <div className="track-section">
          <div className="track-section-head">
            <h2 className="track-section-title">Billing summary</h2>
          </div>
          <div className="track-billing">
            <div className="track-billing-cell">
              <div className="track-billing-label">Subtotal</div>
              <div className="track-billing-val">
                {formatINR(order!.charges?.subtotal ?? 0)}
              </div>
              {(order!.charges?.tierFee ?? 0) > 0 && (
                <div className="track-billing-sub">
                  Platform fee: {formatINR(order!.charges.tierFee)}
                </div>
              )}
            </div>
            <div className="track-billing-cell">
              <div className="track-billing-label">Delivery</div>
              <div className="track-billing-val">
                {deliveryFree ? "Free" : formatINR(order!.charges?.deliveryCharge ?? 0)}
              </div>
              {deliveryFree && (
                <div className="track-billing-sub track-billing-sub--icon">
                  <FiGift className="track-billing-sub-icon" aria-hidden />
                  No delivery charges
                </div>
              )}
            </div>
            <div className="track-billing-cell">
              <div className="track-billing-label">Total charges</div>
              <div className="track-billing-val">
                {formatINR(order!.charges?.total ?? 0)}
              </div>
              <div className="track-billing-sub">Inclusive of all fees</div>
            </div>
          </div>
        </div>

        {/* ── Action row ── */}
        <div className="track-action-row">
          <Link className="track-btn track-btn--primary track-btn--with-icon" to="/pricing">
            <FiPlus aria-hidden />
            Book another service
          </Link>
          <Link className="track-btn track-btn--outline track-btn--with-icon" to="/">
            <FiArrowLeft aria-hidden />
            Back to home
          </Link>
        </div>
      </div>

      {/* ── FAB ── */}
      <Link className="track-fab" to="/pricing">
        <FiPlus className="track-fab-icon" aria-hidden />
        Book another service
      </Link>
    </div>
  );
};

export default Track;
