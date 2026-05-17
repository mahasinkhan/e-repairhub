import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  findBrandByName,
  findServiceById,
  formatInr,
  getQuoteTotal,
} from "../data/repairFlowData";
import "./Pricing.css";

const PHONE_COLORS = [
  { label: "Midnight Black", hex: "#1a1a1a", light: false },
  { label: "Pearl White", hex: "#f5f5f0", light: true },
  { label: "Starlight Blue", hex: "#4a7fa5", light: false },
  { label: "Rose Gold", hex: "#c9927a", light: false },
  { label: "Forest Green", hex: "#3a6b4a", light: false },
  { label: "Lavender", hex: "#9b8ec4", light: false },
  { label: "Coral Red", hex: "#d9534f", light: false },
  { label: "Titanium", hex: "#8a9ba8", light: false },
];

const TIME_SLOTS = [
  "11:00 AM – 01:00 PM",
  "01:00 PM – 03:00 PM",
  "03:00 PM – 05:00 PM",
  "05:00 PM – 07:00 PM",
];

type Step = "color" | "details" | "payment";
type AuthStep = "phone" | "otp";

const StepTracker = ({
  brand,
  service,
  model,
  color,
  currentStep,
}: {
  brand: string | null;
  service: string | null;
  model: string | null;
  color: { label: string; hex: string } | null;
  currentStep: Step;
}) => {
  const steps = [
    { id: "brand", label: "Brand", value: brand },
    { id: "service", label: "Service", value: service },
    { id: "model", label: "Model", value: model },
    { id: "color", label: "Color", value: color?.label ?? null },
  ];

  return (
    <div className="pp-tracker">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className={`pp-tracker__step ${s.value ? "is-done" : "is-pending"}`}>
            <div
              className="pp-tracker__dot"
              style={s.id === "color" && color ? { background: color.hex } : undefined}
            >
              {s.value && s.id !== "color" && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polyline points="2,5 4,7.5 8,2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="pp-tracker__info">
              <span className="pp-tracker__label">{s.label}</span>
              <span className="pp-tracker__value">{s.value ?? "—"}</span>
            </div>
          </div>
          {i < steps.length - 1 && <div className="pp-tracker__line" />}
        </React.Fragment>
      ))}
    </div>
  );
};

const PhoneColorPicker = ({
  selectedColor,
  onSelect,
  phoneModel,
}: {
  selectedColor: { label: string; hex: string; light: boolean } | null;
  onSelect: (c: { label: string; hex: string; light: boolean }) => void;
  phoneModel: string | null;
}) => {
  return (
    <div className="pp-color-section">
      <div className="pp-phone-preview">
        <div
          className="pp-phone-frame"
          style={{ background: selectedColor?.hex ?? "#e0e0e0" }}
        >
          <div className="pp-phone-screen" />
          <div className="pp-phone-notch" />
          <div className="pp-phone-btn pp-phone-btn--vol1" />
          <div className="pp-phone-btn pp-phone-btn--vol2" />
          <div className="pp-phone-btn pp-phone-btn--pwr" />
        </div>
        <p className="pp-phone-name">
          {phoneModel ? decodeURIComponent(phoneModel) : "Your Device"}
        </p>
        {selectedColor && (
          <span className="pp-phone-color-tag" style={{ background: selectedColor.hex, color: selectedColor.light ? "#222" : "#fff" }}>
            {selectedColor.label}
          </span>
        )}
      </div>

      <div className="pp-swatches">
        <p className="pp-swatches__title">Select color</p>
        <div className="pp-swatches__grid">
          {PHONE_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              className={`pp-swatch ${selectedColor?.hex === c.hex ? "is-active" : ""}`}
              style={{ background: c.hex }}
              title={c.label}
              onClick={() => onSelect(c)}
              aria-label={c.label}
            >
              {selectedColor?.hex === c.hex && (
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <polyline points="2,6 5,9 10,3" fill="none" stroke={c.light ? "#222" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
        {!selectedColor && (
          <p className="pp-swatches__hint">Tap a color to continue</p>
        )}
      </div>
    </div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandName = searchParams.get("brand");
  const serviceId = searchParams.get("service");
  const phoneModel = searchParams.get("model");
  const phoneColorParam = searchParams.get("color");

  const brand = findBrandByName(brandName);
  const service = findServiceById(serviceId);

  const [step, setStep] = useState<Step>("color");
  const [selectedColor, setSelectedColor] = useState<{ label: string; hex: string; light: boolean } | null>(
    phoneColorParam
      ? PHONE_COLORS.find((c) => c.label === decodeURIComponent(phoneColorParam)) ?? null
      : null
  );

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [slotDate, setSlotDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotTime, setSlotTime] = useState(TIME_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "">("");
  const [formError, setFormError] = useState<string | null>(null);

  const detailsRef = useRef<HTMLDivElement | null>(null);
  const paymentRef = useRef<HTMLDivElement | null>(null);

  const [isAuthed, setIsAuthed] = useState(() => {
    try {
      return localStorage.getItem("erepairhub.auth.verified") === "1";
    } catch {
      return false;
    }
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>("phone");
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Dummy OTP (for now). Backend integration later.
  const DUMMY_OTP = "123456";

  const startAuth = () => {
    setAuthError(null);
    setAuthStep("phone");
    setAuthOtp("");
    setAuthOpen(true);
  };

  const confirmOtp = () => {
    setAuthError(null);
    if (authOtp.trim() !== DUMMY_OTP) {
      setAuthError("Invalid OTP. Try the dummy OTP shown in this popup.");
      return;
    }
    setIsAuthed(true);
    try {
      localStorage.setItem("erepairhub.auth.verified", "1");
      localStorage.setItem("erepairhub.auth.phone", authPhone.trim());
    } catch {}
    setAuthOpen(false);
    setStep("details");
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  if (!service) {
    return (
      <div className="price-page">
        <div className="price-empty">
          <h1 className="price-empty__title">No service selected</h1>
          <p className="price-empty__text">
            Pick a brand on the home page, choose a service, and we'll show your estimate here.
          </p>
          <Link className="price-btn price-btn--primary" to="/">Back to home</Link>
        </div>
      </div>
    );
  }

  const quoteSubtotal = brand ? getQuoteTotal(brand.name, service) : service.basePrice;
  const tierFee = quoteSubtotal - service.basePrice;
  const deliveryCharge = (service.delivery ?? "").toLowerCase().includes("remote") ? 0 : 99;
  const totalPayable = quoteSubtotal + deliveryCharge;

  const handleColorConfirm = () => {
    if (!selectedColor) return;
    setStep("details");
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDetailsConfirm = () => {
    setFormError(null);
    if (!customerName.trim()) { setFormError("Please enter your name."); return; }
    if (!phone.trim() || phone.trim().length < 10) { setFormError("Please enter a valid 10-digit phone number."); return; }
    if (!address.trim()) { setFormError("Please enter your address."); return; }
    setStep("payment");
    setTimeout(() => {
      paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleBookNow = () => {
    setFormError(null);
    if (!paymentMethod) { setFormError("Please select a payment method."); return; }

    const orderId = `ERH-${Date.now().toString(36).toUpperCase()}`;
    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      brand: brand?.name ?? (brandName ? decodeURIComponent(brandName) : null),
      service: { id: service.id, name: service.name },
      color: selectedColor?.label ?? null,
      payment: {
        method: paymentMethod,
        label: paymentMethod === "cod" ? "Cash on delivery" : "Pay with UPI",
      },
      charges: {
        base: service.basePrice,
        tierFee: Math.max(0, tierFee),
        subtotal: quoteSubtotal,
        deliveryCharge,
        total: totalPayable,
      },
      schedule: { date: slotDate, time: slotTime },
      customer: { name: customerName.trim(), phone: phone.trim(), address: address.trim() },
      statusIndex: 0,
    };

    try { localStorage.setItem("erepairhub.latestOrder", JSON.stringify(order)); } catch { }
    navigate(`/track?order=${encodeURIComponent(orderId)}`);
  };

  return (
    <div className="price-page">
      <div className="price-page__inner">
        {authOpen && (
          <div className="pp-authOverlay" role="dialog" aria-modal="true" aria-label="Login required">
            <div className="pp-authModal">
              <button
                type="button"
                className="pp-authClose"
                aria-label="Close"
                onClick={() => setAuthOpen(false)}
              >
                ×
              </button>

              {authStep === "phone" ? (
                <>
                  <h3 className="pp-authTitle">Login to continue</h3>
                  <p className="pp-authSub">Enter your phone number to receive an OTP.</p>

                  <label className="pp-authField">
                    <span className="pp-authLabel">Phone number</span>
                    <input
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="10-digit number"
                      inputMode="numeric"
                      autoFocus
                    />
                  </label>

                  {authError && <p className="pp-authError">{authError}</p>}

                  <div className="pp-authActions">
                    <button
                      type="button"
                      className="price-btn price-btn--primary"
                      onClick={() => {
                        setAuthError(null);
                        const p = authPhone.trim();
                        if (!p || p.replace(/\D/g, "").length < 10) {
                          setAuthError("Please enter a valid 10-digit phone number.");
                          return;
                        }
                        setAuthStep("otp");
                      }}
                    >
                      Send OTP
                    </button>
                    <button type="button" className="price-btn price-btn--ghost" onClick={() => setAuthOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="pp-authTitle">Enter OTP</h3>
                  <p className="pp-authSub">
                    Dummy OTP for now: <strong className="pp-authOtpHint">{DUMMY_OTP}</strong>
                  </p>

                  <label className="pp-authField">
                    <span className="pp-authLabel">OTP</span>
                    <input
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      placeholder="6-digit OTP"
                      inputMode="numeric"
                      autoFocus
                    />
                  </label>

                  {authError && <p className="pp-authError">{authError}</p>}

                  <div className="pp-authActions">
                    <button type="button" className="price-btn price-btn--primary" onClick={confirmOtp}>
                      Verify & continue
                    </button>
                    <button
                      type="button"
                      className="price-btn price-btn--ghost"
                      onClick={() => {
                        setAuthError(null);
                        setAuthStep("phone");
                        setAuthOtp("");
                      }}
                    >
                      Change number
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <p className="price-page__eyebrow">Repair estimate</p>
        <h1 className="price-page__title">Your booking summary</h1>
        <p className="price-page__lead">
          Review your device, pick a color, fill in details, and confirm your booking below.
        </p>

        {/* Step Tracker */}
        <StepTracker
          brand={brand?.name ?? (brandName ? decodeURIComponent(brandName) : null)}
          service={service.name}
          model={phoneModel ? decodeURIComponent(phoneModel) : null}
          color={selectedColor}
          currentStep={step}
        />

        <div className="pp-layout">
          {/* LEFT: Color stays on left */}
          <aside className="pp-left">
            <div className="pp-card">
              <div className="pp-card__head">
                <h2 className="pp-card__title">Choose your device color</h2>
                <p className="pp-card__sub">Select the color that matches your phone</p>
              </div>

              <PhoneColorPicker
                selectedColor={selectedColor}
                onSelect={(c) => {
                  setSelectedColor(c);
                  if (!isAuthed) startAuth();
                }}
                phoneModel={phoneModel}
              />

              <div className="pp-left-actions">
                {step === "color" ? (
                  <button
                    type="button"
                    className="price-btn price-btn--primary"
                    disabled={!selectedColor}
                    onClick={handleColorConfirm}
                  >
                    Continue to details
                  </button>
                ) : (
                  <button type="button" className="price-btn price-btn--ghost" onClick={() => setStep("color")}>
                    Change color
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT: Panels slide from right */}
          <section className="pp-right">
            <div className="pp-panels">
              <div
                ref={detailsRef}
                className={`pp-panel ${step === "color" || step === "details" ? "is-on" : step === "payment" ? "is-prev" : ""}`}
              >
                <div className="pp-card">
                  <div className="pp-card__head">
                    <h2 className="pp-card__title">Your details & schedule</h2>
                    <p className="pp-card__sub">We'll use these to arrange your pickup</p>
                  </div>

                  {step === "color" && (
                    <p className="pp-step-locked-msg">
                      {isAuthed
                        ? "Select a color on the left, then click “Continue to details” to start filling this form."
                        : "Select a color on the left — login popup will appear — then you can fill this form."}
                    </p>
                  )}

                  <div className="pp-form-grid">
                    <label className="price-field">
                      <span className="price-field__label">Name</span>
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your full name"
                        disabled={step !== "details" || !isAuthed}
                      />
                    </label>
                    <label className="price-field">
                      <span className="price-field__label">Phone</span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number"
                        inputMode="numeric"
                        disabled={step !== "details" || !isAuthed}
                      />
                    </label>
                    <label className="price-field">
                      <span className="price-field__label">Pickup date</span>
                      <input
                        type="date"
                        value={slotDate}
                        onChange={(e) => setSlotDate(e.target.value)}
                        disabled={step !== "details" || !isAuthed}
                      />
                    </label>
                    <label className="price-field">
                      <span className="price-field__label">Time slot</span>
                      <select
                        value={slotTime}
                        onChange={(e) => setSlotTime(e.target.value)}
                        disabled={step !== "details" || !isAuthed}
                      >
                        {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </label>
                    <label className="price-field price-field--full">
                      <span className="price-field__label">Address</span>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House no, street, landmark, city"
                        rows={3}
                        disabled={step !== "details" || !isAuthed}
                      />
                    </label>
                  </div>

                  {step === "details" && formError && <p className="price-form-error">{formError}</p>}

                  <div className="pp-step-actions">
                    <button type="button" className="price-btn price-btn--primary" onClick={handleDetailsConfirm}>
                      Continue to payment
                    </button>
                    <button type="button" className="price-btn price-btn--ghost" onClick={() => setStep("color")}>
                      Back
                    </button>
                  </div>
                </div>
              </div>

              <div ref={paymentRef} className={`pp-panel ${step === "payment" ? "is-on" : ""}`}>
                <div className="pp-card">
                  <div className="pp-card__head">
                    <h2 className="pp-card__title">Payment & confirm</h2>
                    <p className="pp-card__sub">Choose how you'd like to pay</p>
                  </div>

                  <div className="price-pay" role="radiogroup" aria-label="Payment method">
                    <label className={`price-pay__opt${paymentMethod === "cod" ? " is-on" : ""}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                      <span className="price-pay__text">
                        <span className="price-pay__title">Cash on delivery</span>
                        <span className="price-pay__sub">Pay after service / pickup</span>
                      </span>
                    </label>
                    <label className={`price-pay__opt${paymentMethod === "upi" ? " is-on" : ""}`}>
                      <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
                      <span className="price-pay__text">
                        <span className="price-pay__title">Pay with UPI</span>
                        <span className="price-pay__sub">Google Pay / PhonePe / Paytm</span>
                      </span>
                    </label>
                  </div>

                  {formError && <p className="price-form-error">{formError}</p>}

                  <div className="pp-final-bill">
                    <div className="price-bill">
                      <div className="price-bill__row"><span>Subtotal</span><span>{formatInr(quoteSubtotal)}</span></div>
                      <div className="price-bill__row"><span>Delivery</span><span>{deliveryCharge === 0 ? "Free" : formatInr(deliveryCharge)}</span></div>
                      <div className="price-bill__total"><span>Total payable</span><strong>{formatInr(totalPayable)}</strong></div>
                    </div>
                    <button type="button" className="price-btn price-btn--primary pp-book-btn" onClick={handleBookNow}>
                      Confirm &amp; book now
                    </button>
                    <button type="button" className="price-btn price-btn--ghost" onClick={() => setStep("details")}>
                      Back
                    </button>
                    <p className="pp-tax-note">Inclusive of all taxes · No hidden charges</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
