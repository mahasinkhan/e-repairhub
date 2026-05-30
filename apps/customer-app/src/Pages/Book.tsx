import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getBrandsFromAPI, getModelsFromAPI, getServicesFromAPI,
  bookRepair, applyCoupon, recordCouponUsage,
} from "../services/api";
import OtpModal from "../Components/OtpModal";

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";
const STEPS    = ["Brand", "Model", "Service", "Details", "Confirm"];

function imgUrl(src: string) {
  if (!src) return "";
  return src.startsWith("http") ? src : `${BASE_URL}${src}`;
}

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36 }}>
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: done ? "#22c55e" : active ? "#f97316" : "#e2e8f0",
                border: `3px solid ${done ? "#22c55e" : active ? "#f97316" : "#e2e8f0"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: done || active ? "#fff" : "#94a3b8",
                fontSize: 13, fontWeight: 700, transition: "all .3s",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <p style={{
                fontSize: 11, fontWeight: active ? 700 : 400,
                color: active ? "#f97316" : done ? "#22c55e" : "#94a3b8",
                marginTop: 5, whiteSpace: "nowrap",
              }}>
                {label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 48, height: 2,
                background: i < current ? "#22c55e" : "#e2e8f0",
                marginBottom: 20, flexShrink: 0,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Book() {
  const navigate    = useNavigate();
  const [urlParams] = useSearchParams();

  const prefilledBrand   = urlParams.get("brand")   || "";
  const prefilledService = urlParams.get("service")  || "";
  const prefilledModel   = urlParams.get("model")    || "";

  const [step, setStep] = useState(0);

  // API data
  const [brands,   setBrands]   = useState<any[]>([]);
  const [models,   setModels]   = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Selections
  const [selectedBrand,   setSelectedBrand]   = useState<any>(null);
  const [selectedModel,   setSelectedModel]   = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Search
  const [brandSearch,   setBrandSearch]   = useState("");
  const [modelSearch,   setModelSearch]   = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  // Customer details
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [address, setAddress] = useState("");
  const [issue,   setIssue]   = useState("");
  const [color,   setColor]   = useState("");

  // OTP
  const [otpModalOpen,  setOtpModalOpen]  = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Coupon
  const [couponCode,    setCouponCode]    = useState("");
  const [couponResult,  setCouponResult]  = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError,   setCouponError]   = useState("");

  // Payment
  const [paymentMethod,     setPaymentMethod]     = useState<"cod" | "online" | "">("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // UI state
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  // Final price after coupon
  const finalPrice = couponResult?.finalAmount ?? selectedService?.price ?? 0;

  // Reset phone verification if phone changes
  useEffect(() => { setPhoneVerified(false); }, [phone]);

  // Reset coupon + payment when service changes
  useEffect(() => {
    setCouponResult(null);
    setCouponCode("");
    setCouponError("");
    setPaymentMethod("");
  }, [selectedService]);

  // ── Load brands ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getBrandsFromAPI().then(data => {
      setBrands(data);
      if (prefilledBrand && data.length > 0) {
        const found = data.find((b: any) => b.name.toLowerCase() === prefilledBrand.toLowerCase());
        if (found) { setSelectedBrand(found); setStep(1); }
      }
      setLoading(false);
    });
  }, [prefilledBrand]);

  // ── Load models ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedBrand) return;
    setLoading(true);
    setModels([]);
    setSelectedModel(null);
    setServices([]);
    setSelectedService(null);
    getModelsFromAPI(selectedBrand._id).then(data => {
      setModels(data);
      if (prefilledModel && data.length > 0) {
        const found = data.find((m: any) => m.name.toLowerCase() === prefilledModel.toLowerCase());
        if (found) { setSelectedModel(found); setStep(2); }
      }
      setLoading(false);
    });
  }, [selectedBrand, prefilledModel]);

  // ── Load services ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedModel) return;
    setLoading(true);
    setServices([]);
    setSelectedService(null);
    getServicesFromAPI(selectedModel._id).then(data => {
      setServices(data);
      if (prefilledService && data.length > 0) {
        const found = data.find((s: any) => s.name.toLowerCase() === prefilledService.toLowerCase());
        if (found) { setSelectedService(found); setStep(3); }
      }
      setLoading(false);
    });
  }, [selectedModel, prefilledService]);

  // ── Validate details ─────────────────────────────────────────────────────────
  const validateDetails = (): boolean => {
    if (!name.trim())                                          { setError("Please enter your name"); return false; }
    if (!phone.trim() || phone.replace(/\D/g,"").length < 10) { setError("Please enter a valid 10-digit phone number"); return false; }
    if (!address.trim())                                       { setError("Please enter your address"); return false; }
    if (!issue.trim())                                         { setError("Please describe the issue"); return false; }
    return true;
  };

  // ── Apply coupon ─────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);
    try {
      const result = await applyCoupon(
        couponCode.trim(),
        selectedService.price,
        selectedBrand?.name,
        selectedService?.name,
      );
      setCouponResult(result);
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon");
    } finally { setCouponLoading(false); }
  };

  // ── Submit booking ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!paymentMethod) { setError("Please select a payment method to continue"); return; }
    setSubmitting(true);
    setError("");

    try {
      // Step 1 — Place the order
      const order = await bookRepair({
        customer:      { name: name.trim(), phone: phone.trim(), address: address.trim() },
        deviceDetails: {
          brand: selectedBrand.name,
          model: selectedModel.name,
          color: color || undefined,
          issue: issue.trim(),
        },
        serviceType: selectedService.name,
        price:       finalPrice,
      });

      // Record coupon usage
      if (couponResult && couponCode.trim()) {
        await recordCouponUsage(couponCode.trim());
      }

      // Save order to localStorage
      localStorage.setItem("erepairhub.latestOrder", JSON.stringify({
        id:          order.orderNumber,
        orderNumber: order.orderNumber,
        createdAt:   order.createdAt,
        brand:       selectedBrand.name,
        service:     { id: selectedService._id, name: selectedService.name },
        charges: {
          base:       selectedService.price,
          discount:   couponResult?.discountAmount ?? 0,
          couponCode: couponResult ? couponCode : null,
          total:      finalPrice,
        },
        paymentMethod,
        customer: { name: name.trim(), phone: phone.trim(), address: address.trim() },
        statusIndex: 0,
        status: "placed",
      }));

      // Step 2 — COD → go straight to confirm
      if (paymentMethod === "cod") {
        navigate(`/confirm?order=${order.orderNumber}`);
        return;
      }

      // Step 3 — Online → open Razorpay
      setSubmitting(false);
      setPaymentProcessing(true);

      const { openRazorpayCheckout } = await import("../Components/RazorpayCheckout");

      await openRazorpayCheckout({
        orderNumber:   order.orderNumber,
        amount:        finalPrice,
        customerName:  name.trim(),
        customerPhone: phone.trim(),
        description:   `${selectedService.name} — ${selectedBrand.name} ${selectedModel.name}`,
        onSuccess: (paymentId: string) => {
          setPaymentProcessing(false);
          navigate(`/confirm?order=${order.orderNumber}&paid=true&paymentId=${paymentId}`);
        },
        onFailure: (errMsg: string) => {
          setPaymentProcessing(false);
          if (errMsg === "Payment cancelled") {
            // Order placed but not paid — still go to confirm, can pay later
            navigate(`/confirm?order=${order.orderNumber}`);
          } else {
            setError(`Payment failed: ${errMsg}. Your order is saved — you can pay later.`);
            // Still navigate after 2 seconds
            setTimeout(() => navigate(`/confirm?order=${order.orderNumber}`), 2500);
          }
        },
      });

    } catch (err: any) {
      setError(err.message || "Booking failed. Please try again.");
      setSubmitting(false);
      setPaymentProcessing(false);
    }
  };

  const cardBase = {
    background: "#fff", border: "1.5px solid #e2e8f0",
    borderRadius: 16, padding: "16px",
    cursor: "pointer", transition: "all .15s", textAlign: "center" as const,
  };

  const isDisabled = submitting || paymentProcessing || !paymentMethod;

  return (
    <div style={{ minHeight: "80vh", background: "#f8fafc", padding: "40px 16px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>📱 Book Your Repair</h1>
          <p style={{ fontSize: 15, color: "#64748b" }}>Select your device and service — we'll handle the rest</p>
        </div>

        <StepBar current={step} />

        {/* ── STEP 0 — Brand ───────────────────────────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Select Your Brand</h2>
            <input value={brandSearch} onChange={e => setBrandSearch(e.target.value)}
              placeholder="🔍 Search brand..."
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Loading brands...</div>
            ) : brands.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                <p style={{ fontSize: 14 }}>No brands found in catalog</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Add brands in Admin → Catalog first</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                {brands
                  .filter(b => !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                  .map(brand => (
                    <button key={brand._id} onClick={() => { setSelectedBrand(brand); setStep(1); }}
                      style={cardBase}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.border = "1.5px solid #f97316"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(249,115,22,0.15)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.border = "1.5px solid #e2e8f0"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
                      {brand.image ? (
                        <img src={imgUrl(brand.image)} alt={brand.name}
                          style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 8 }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div style={{ width: 48, height: 48, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 20, fontWeight: 700, color: "#64748b" }}>
                          {brand.name.charAt(0)}
                        </div>
                      )}
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{brand.name}</p>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1 — Model ───────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <button onClick={() => setStep(0)}
              style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ← Back to Brands
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              {selectedBrand?.image && (
                <img src={imgUrl(selectedBrand.image)} alt=""
                  style={{ width: 36, height: 36, objectFit: "contain" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Select {selectedBrand?.name} Model</h2>
            </div>
            <input value={modelSearch} onChange={e => setModelSearch(e.target.value)}
              placeholder="🔍 Search model..."
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Loading models...</div>
            ) : models.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                <p>No models found for {selectedBrand?.name}</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Add models in Admin → Catalog → {selectedBrand?.name}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                {models
                  .filter(m => !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase()))
                  .map(model => (
                    <button key={model._id} onClick={() => { setSelectedModel(model); setStep(2); }}
                      style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px 10px", cursor: "pointer", transition: "all .15s", textAlign: "center" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.border = "1.5px solid #f97316"; (e.currentTarget as HTMLButtonElement).style.background = "#fff7ed"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.border = "1.5px solid #e2e8f0"; (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}>
                      {model.image ? (
                        <img src={imgUrl(model.image)} alt={model.name}
                          style={{ width: 40, height: 40, objectFit: "contain", marginBottom: 6 }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📱</div>
                      )}
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", margin: 0, lineHeight: 1.3 }}>{model.name}</p>
                      <p style={{ fontSize: 10, color: "#94a3b8", margin: "3px 0 0" }}>{model.deviceType}</p>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 — Service ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)}
              style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ← Back to Models
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Select Repair Service</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{selectedBrand?.name} {selectedModel?.name}</p>
            <input value={serviceSearch} onChange={e => setServiceSearch(e.target.value)}
              placeholder="🔍 Search service..."
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Loading services...</div>
            ) : services.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                <p>No services found for {selectedModel?.name}</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Add services in Admin → Catalog → {selectedBrand?.name} → {selectedModel?.name}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {services
                  .filter(s => !serviceSearch || s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                  .map(service => (
                    <button key={service._id} onClick={() => { setSelectedService(service); setStep(3); }}
                      style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "16px 18px", cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.border = "1.5px solid #f97316"; (e.currentTarget as HTMLButtonElement).style.background = "#fff7ed"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.border = "1.5px solid #e2e8f0"; (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}>
                      {service.image ? (
                        <img src={imgUrl(service.image)} alt={service.name}
                          style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 10, flexShrink: 0 }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div style={{ width: 52, height: 52, background: "#f1f5f9", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🔧</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", margin: 0 }}>{service.name}</p>
                        {service.description && <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0", lineHeight: 1.4 }}>{service.description}</p>}
                        {service.estimatedTime && <p style={{ fontSize: 11, color: "#64748b", margin: "6px 0 0" }}>⏱ {service.estimatedTime}</p>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: "#f97316", margin: 0 }}>₹{Number(service.price).toLocaleString("en-IN")}</p>
                        <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>Starting from</p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3 — Details ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)}
              style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ← Back to Services
            </button>

            {/* Summary bar */}
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 14, padding: "14px 16px", marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div><span style={{ fontSize: 11, color: "#94a3b8" }}>Brand</span><p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 13 }}>{selectedBrand?.name}</p></div>
              <div><span style={{ fontSize: 11, color: "#94a3b8" }}>Model</span><p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 13 }}>{selectedModel?.name}</p></div>
              <div><span style={{ fontSize: 11, color: "#94a3b8" }}>Service</span><p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 13 }}>{selectedService?.name}</p></div>
              <div style={{ marginLeft: "auto" }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Price</span>
                <p style={{ margin: "2px 0 0", fontWeight: 800, fontSize: 18, color: "#f97316" }}>₹{Number(selectedService?.price).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>Your Details</h2>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const }}>Full Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                    style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const }}>Phone Number *</label>
                  <div style={{ position: "relative" }}>
                    <input value={phone} onChange={e => { setPhone(e.target.value); setPhoneVerified(false); }}
                      placeholder="10-digit mobile number" type="tel"
                      style={{ width: "100%", border: `1.5px solid ${phoneVerified ? "#22c55e" : "#e2e8f0"}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const, paddingRight: phoneVerified ? "40px" : "14px" }} />
                    {phoneVerified && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#22c55e", fontSize: 18 }}>✓</span>}
                  </div>
                  {phoneVerified && <p style={{ fontSize: 11, color: "#22c55e", margin: "4px 0 0", fontWeight: 600 }}>✅ Phone verified</p>}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const }}>Pickup Address *</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address for pickup" rows={2}
                  style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", resize: "none" as const, boxSizing: "border-box" as const }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const }}>Issue / Problem *</label>
                  <input value={issue} onChange={e => setIssue(e.target.value)} placeholder="e.g. Cracked screen"
                    style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const }}>Device Color</label>
                  <input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Midnight Black"
                    style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
                </div>
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                  <p style={{ color: "#b91c1c", fontSize: 13, margin: 0 }}>⚠️ {error}</p>
                </div>
              )}

              {!phoneVerified ? (
                <button onClick={() => { setError(""); if (validateDetails()) setOtpModalOpen(true); }}
                  style={{ width: "100%", background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: 12, padding: "14px 0", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  🔐 Verify Phone & Continue
                </button>
              ) : (
                <button onClick={() => { setError(""); setStep(4); }}
                  style={{ width: "100%", background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: 12, padding: "14px 0", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  ✅ Phone Verified — Review Booking →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 4 — Review & Confirm ────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <button onClick={() => setStep(3)}
              style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ← Back to Details
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>Review Your Booking</h2>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

              {/* Dark header */}
              <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "20px 24px" }}>
                <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Repair Booking</p>
                <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0 }}>{selectedBrand?.name} {selectedModel?.name}</h3>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>{selectedService?.name}</p>
              </div>

              <div style={{ padding: "20px 24px" }}>

                {/* Phone verified */}
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#15803d", margin: 0 }}>Phone Verified</p>
                    <p style={{ fontSize: 11, color: "#16a34a", margin: 0 }}>{phone} · Verified via OTP</p>
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  {([
                    ["👤 Customer", name],
                    ["📱 Phone",    phone],
                    ["📍 Address",  address],
                    ["🔧 Issue",    issue],
                    ["🎨 Color",    color || "Not specified"],
                    ["💰 Original", `₹${Number(selectedService?.price).toLocaleString("en-IN")}`],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
                      <p style={{ fontSize: 13, color: "#1e293b", fontWeight: 600, margin: 0, wordBreak: "break-word" as const }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* ── Coupon Code ─────────────────────────────────────────── */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const }}>
                    🎟️ Have a Coupon Code?
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(""); }}
                      placeholder="Enter coupon code"
                      style={{
                        flex: 1, border: `1.5px solid ${couponResult ? "#22c55e" : couponError ? "#fca5a5" : "#e2e8f0"}`,
                        borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none",
                        fontFamily: "monospace", letterSpacing: "0.1em",
                        background: couponResult ? "#f0fdf4" : "#fff",
                      }}
                    />
                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                      style={{
                        padding: "10px 18px",
                        background: couponLoading || !couponCode.trim() ? "#e2e8f0" : "#f97316",
                        border: "none", borderRadius: 10,
                        color: couponLoading || !couponCode.trim() ? "#94a3b8" : "#fff",
                        fontSize: 13, fontWeight: 700,
                        cursor: couponLoading || !couponCode.trim() ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                      }}>
                      {couponLoading ? "..." : couponResult ? "✓ Applied" : "Apply"}
                    </button>
                  </div>
                  {couponError && <p style={{ fontSize: 12, color: "#b91c1c", margin: "6px 0 0" }}>❌ {couponError}</p>}
                  {couponResult && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginTop: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: 0 }}>{couponResult.message}</p>
                      <p style={{ fontSize: 11, color: "#16a34a", margin: "3px 0 0" }}>
                        Original: ₹{Number(couponResult.originalAmount).toLocaleString("en-IN")} → Discount: -₹{Number(couponResult.discountAmount).toLocaleString("en-IN")}
                      </p>
                      <button onClick={() => { setCouponResult(null); setCouponCode(""); setCouponError(""); }}
                        style={{ background: "none", border: "none", color: "#64748b", fontSize: 11, cursor: "pointer", marginTop: 4, textDecoration: "underline" }}>
                        Remove coupon
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Price Summary ────────────────────────────────────────── */}
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                  {couponResult && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>Original Price</span>
                      <span style={{ fontSize: 13, color: "#94a3b8", textDecoration: "line-through" }}>
                        ₹{Number(selectedService?.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {couponResult && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#15803d" }}>🎟️ Discount ({couponCode})</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
                        -₹{Number(couponResult.discountAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: couponResult ? "1px solid #bbf7d0" : "none", paddingTop: couponResult ? 8 : 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#15803d" }}>Total Amount</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#15803d" }}>
                      ₹{Number(finalPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "#16a34a", margin: "4px 0 0" }}>
                    ✅ Free pickup & delivery
                  </p>
                </div>

                {/* ── Payment Method ───────────────────────────────────────── */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase" as const }}>
                    💳 Select Payment Method *
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

                    {/* Cash on Delivery */}
                    <button onClick={() => setPaymentMethod("cod")}
                      style={{
                        border: `2px solid ${paymentMethod === "cod" ? "#22c55e" : "#e2e8f0"}`,
                        borderRadius: 14, padding: "16px 12px", cursor: "pointer",
                        background: paymentMethod === "cod" ? "#f0fdf4" : "#fff",
                        transition: "all .15s", textAlign: "center" as const,
                      }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>💵</div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: paymentMethod === "cod" ? "#15803d" : "#1e293b", margin: "0 0 2px" }}>
                        Cash on Delivery
                      </p>
                      <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>Pay after repair is done</p>
                      {paymentMethod === "cod" && (
                        <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: 999 }}>
                          ✓ Selected
                        </span>
                      )}
                    </button>

                    {/* Pay Online */}
                    <button onClick={() => setPaymentMethod("online")}
                      style={{
                        border: `2px solid ${paymentMethod === "online" ? "#f97316" : "#e2e8f0"}`,
                        borderRadius: 14, padding: "16px 12px", cursor: "pointer",
                        background: paymentMethod === "online" ? "#fff7ed" : "#fff",
                        transition: "all .15s", textAlign: "center" as const,
                      }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📱</div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: paymentMethod === "online" ? "#f97316" : "#1e293b", margin: "0 0 2px" }}>
                        Pay Online
                      </p>
                      <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>UPI / Card / Net Banking</p>
                      {paymentMethod === "online" && (
                        <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 700, color: "#ea580c", background: "#fff7ed", border: "1px solid #fed7aa", padding: "2px 8px", borderRadius: 999 }}>
                          ✓ Selected
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Payment info banners */}
                  {paymentMethod === "cod" && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginTop: 10 }}>
                      <p style={{ fontSize: 12, color: "#15803d", margin: 0, fontWeight: 600 }}>
                        ✅ Pay cash to our delivery agent when your repaired device is returned to you.
                      </p>
                    </div>
                  )}
                  {paymentMethod === "online" && (
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 14px", marginTop: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", margin: "0 0 6px" }}>
                        🔐 Secure Payment via Razorpay
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["📲 UPI", "💳 Credit/Debit Card", "🏦 Net Banking", "👛 Wallets"].map(m => (
                          <span key={m} style={{ fontSize: 11, fontWeight: 600, color: "#3b82f6", background: "#dbeafe", padding: "3px 10px", borderRadius: 999 }}>{m}</span>
                        ))}
                      </div>
                      <p style={{ fontSize: 11, color: "#6b7280", margin: "8px 0 0" }}>
                        After clicking confirm, Razorpay checkout will open. Your data is 256-bit SSL encrypted.
                      </p>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                    <p style={{ color: "#b91c1c", fontSize: 13, margin: 0 }}>❌ {error}</p>
                  </div>
                )}

                {/* Payment processing overlay message */}
                {paymentProcessing && (
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, border: "2px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: "#1d4ed8", margin: 0, fontWeight: 600 }}>
                      Opening Razorpay secure payment gateway...
                    </p>
                  </div>
                )}

                {/* Confirm button */}
                <button
                  onClick={handleSubmit}
                  disabled={isDisabled}
                  style={{
                    width: "100%",
                    background: submitting || paymentProcessing
                      ? "#94a3b8"
                      : !paymentMethod
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #f97316, #ea580c)",
                    border: "none", borderRadius: 12, padding: "16px 0",
                    color: isDisabled ? "#94a3b8" : "#fff",
                    fontSize: 16, fontWeight: 800,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: !isDisabled ? "0 4px 14px rgba(249,115,22,0.4)" : "none",
                    transition: "all .2s",
                  }}>
                  {submitting
                    ? "⏳ Placing your order..."
                    : paymentProcessing
                    ? "🔐 Opening payment gateway..."
                    : !paymentMethod
                    ? "👆 Select a payment method above"
                    : paymentMethod === "online"
                    ? `✅ Confirm & Pay ₹${Number(finalPrice).toLocaleString("en-IN")} Online`
                    : "✅ Confirm Booking (Pay on Delivery)"
                  }
                </button>

                <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
                  By confirming, you agree to our terms. Our team will contact you within 30 minutes.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* OTP Modal */}
      <OtpModal
        open={otpModalOpen}
        phone={phone}
        onClose={() => setOtpModalOpen(false)}
        onVerified={() => {
          setPhoneVerified(true);
          setOtpModalOpen(false);
          setStep(4);
        }}
      />
    </div>
  );
}