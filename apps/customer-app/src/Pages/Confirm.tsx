import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { trackOrder } from "../services/api";

const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

export default function Confirm() {
  const [searchParams] = useSearchParams();
  const orderNumber  = searchParams.get("order");
  const paidParam    = searchParams.get("paid");
  const paymentIdParam = searchParams.get("paymentId");

  const [order,           setOrder]           = useState<any>(null);
  const [loading,         setLoading]         = useState(true);
  const [paymentStatus,   setPaymentStatus]   = useState<"paid" | "pending" | "">("");
  const [payProcessing,   setPayProcessing]   = useState(false);
  const [payError,        setPayError]        = useState("");
  const [paySuccess,      setPaySuccess]      = useState(false);

  useEffect(() => {
    if (!orderNumber) { setLoading(false); return; }

    // If came with paid=true from Razorpay redirect
    if (paidParam === "true") {
      setPaymentStatus("paid");
      setPaySuccess(true);
    }

    trackOrder(orderNumber)
      .then(data => {
        setOrder(data);
        // Use backend paymentStatus as source of truth
        if (data.paymentStatus === "paid") {
          setPaymentStatus("paid");
        } else if (!paidParam) {
          setPaymentStatus("pending");
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem("erepairhub.latestOrder");
          if (saved) {
            const parsed = JSON.parse(saved);
            setOrder(parsed);
            if (!paidParam) setPaymentStatus("pending");
          }
        } catch {}
      })
      .finally(() => setLoading(false));
  }, [orderNumber, paidParam]);

  const handlePayNow = async () => {
    if (!orderNumber || !order) return;
    setPayProcessing(true);
    setPayError("");

    try {
      const { openRazorpayCheckout } = await import("../Components/RazorpayCheckout");
      const price = order.price ?? order.charges?.total ?? 0;
      const customerName  = order.customer?.name  ?? "";
      const customerPhone = order.customer?.phone ?? "";
      const description   = `${order.serviceType ?? "Repair"} — ${order.deviceDetails?.brand ?? ""} ${order.deviceDetails?.model ?? ""}`;

      await openRazorpayCheckout({
        orderNumber,
        amount:        price,
        customerName,
        customerPhone,
        description,
        onSuccess: (paymentId: string) => {
          setPayProcessing(false);
          setPaymentStatus("paid");
          setPaySuccess(true);
          setPayError("");
          // Update order price display
          if (order) setOrder({ ...order, paymentStatus: "paid" });
        },
        onFailure: (errMsg: string) => {
          setPayProcessing(false);
          if (errMsg !== "Payment cancelled") {
            setPayError(`Payment failed: ${errMsg}`);
          }
        },
      });
    } catch (e: any) {
      setPayProcessing(false);
      setPayError(e.message || "Could not open payment gateway");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
      <p>Loading your booking...</p>
    </div>
  );

  const isPaid    = paymentStatus === "paid" || order?.paymentStatus === "paid";
  const price     = order?.price ?? order?.charges?.total ?? 0;
  const localData = (() => {
    try { return JSON.parse(localStorage.getItem("erepairhub.latestOrder") || "{}"); } catch { return {}; }
  })();

  return (
    <div style={{ minHeight: "80vh", background: isPaid ? "#f0fdf4" : "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>

        {/* Success / Pending icon */}
        <div style={{
          width: 80, height: 80,
          background: isPaid ? "#22c55e" : "#f97316",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 36,
          boxShadow: `0 0 0 12px ${isPaid ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.15)"}`,
        }}>
          {isPaid ? "✓" : "📋"}
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: isPaid ? "#15803d" : "#1e293b", margin: "0 0 8px" }}>
          {isPaid ? "Booking Confirmed! 🎉" : "Order Placed! 📋"}
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", marginBottom: 16 }}>
          {isPaid
            ? "Your repair has been booked and payment received. Our team will contact you shortly."
            : "Your order is placed. Complete payment to confirm your booking."
          }
        </p>

        {/* Payment success banner */}
        {paySuccess && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: 0 }}>Payment Successful!</p>
              {paymentIdParam && <p style={{ fontSize: 11, color: "#16a34a", margin: "2px 0 0", fontFamily: "monospace" }}>ID: {paymentIdParam}</p>}
            </div>
          </div>
        )}

        {/* Pending payment banner */}
        {!isPaid && !paySuccess && (
          <div style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#c2410c", margin: "0 0 4px" }}>
              ⏳ Payment Pending
            </p>
            <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>
              Your order is saved. Click "Pay Now" below to complete payment via Razorpay.
            </p>
          </div>
        )}

        {/* Order card */}
        <div style={{ background: "#fff", border: `1px solid ${isPaid ? "#bbf7d0" : "#e2e8f0"}`, borderRadius: 18, padding: "24px", marginBottom: 20, boxShadow: "0 4px 14px rgba(0,0,0,0.06)", textAlign: "left" }}>
          <div style={{ background: isPaid ? "#f0fdf4" : "#f8fafc", borderRadius: 12, padding: "14px 16px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: isPaid ? "#16a34a" : "#64748b", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase" as const }}>Order Number</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: isPaid ? "#15803d" : "#1e293b", margin: 0, letterSpacing: "0.05em", fontFamily: "monospace" }}>
              {orderNumber || order?.orderNumber || "—"}
            </p>
            <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>Save this for tracking your repair</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["📱 Device",   order ? `${order.deviceDetails?.brand || ""} ${order.deviceDetails?.model || ""}` : `${localData.brand || ""}`],
              ["🔧 Service",  order?.serviceType || localData.service?.name || "—"],
              ["👤 Customer", order?.customer?.name || localData.customer?.name || "—"],
              ["📍 Pickup",   order?.customer?.address || localData.customer?.address || "—"],
              ["💰 Amount",   `₹${Number(price || localData.charges?.total || 0).toLocaleString("en-IN")}`],
              ["💳 Payment",  isPaid ? "✅ Paid" : "⏳ Pending"],
            ].map(([label, value]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: label === "💳 Payment"
                    ? (isPaid ? "#15803d" : "#c2410c")
                    : "#1e293b",
                }}>
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pay Now button — shown when payment pending */}
        {!isPaid && !paySuccess && (
          <div style={{ marginBottom: 16 }}>
            {payError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
                <p style={{ fontSize: 12, color: "#b91c1c", margin: 0 }}>❌ {payError}</p>
              </div>
            )}

            <button
              onClick={handlePayNow}
              disabled={payProcessing}
              style={{
                width: "100%", padding: "16px",
                background: payProcessing
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #f97316, #ea580c)",
                border: "none", borderRadius: 12, color: "#fff",
                fontSize: 16, fontWeight: 800,
                cursor: payProcessing ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: payProcessing ? "none" : "0 4px 14px rgba(249,115,22,0.4)",
                marginBottom: 8,
              }}>
              {payProcessing
                ? <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Opening Razorpay...</>
                : `🔐 Pay Now ₹${Number(price || localData.charges?.total || 0).toLocaleString("en-IN")} via Razorpay`
              }
            </button>

            {/* Payment methods hint */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
              {["📲 UPI", "💳 Card", "🏦 Net Banking", "👛 Wallet"].map(m => (
                <span key={m} style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "3px 10px", borderRadius: 999 }}>{m}</span>
              ))}
            </div>
          </div>
        )}

        {/* What happens next */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px", marginBottom: 20, textAlign: "left" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: "0 0 12px" }}>What happens next?</h3>
          {[
            { emoji: "📞", text: "Our team will call you within 30 minutes to confirm pickup time" },
            { emoji: "🚗", text: "Delivery agent will pick up your device from your address" },
            { emoji: "🔧", text: "Your device will be repaired at our franchise center" },
            { emoji: "🏠", text: "Device delivered back to you after repair" },
          ].map(item => (
            <div key={item.text} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
              <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.4 }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            to={`/track?orderNumber=${orderNumber || order?.orderNumber}`}
            style={{
              flex: 1, background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff", borderRadius: 12, padding: "14px 0",
              textAlign: "center", fontWeight: 700, fontSize: 14,
              textDecoration: "none", display: "block",
            }}>
            📍 Track Order
          </Link>
          <Link
            to="/"
            style={{
              flex: 1, background: "#fff", border: "1.5px solid #e2e8f0",
              color: "#475569", borderRadius: 12, padding: "14px 0",
              textAlign: "center", fontWeight: 600, fontSize: 14,
              textDecoration: "none", display: "block",
            }}>
            🏠 Home
          </Link>
        </div>

      </div>
    </div>
  );
}