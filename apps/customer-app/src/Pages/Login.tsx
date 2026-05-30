import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { customerSendOtp, customerVerifyOtp } from "../services/api";
import { useCustomerAuth } from "../context/CustomerAuth";
import Footer from "../Components/Footer";

type Step = "phone" | "otp";

export default function Login() {
  const navigate               = useNavigate();
  const { login, isLoggedIn }  = useCustomerAuth();

  const [step,      setStep]      = useState<Step>("phone");
  const [phone,     setPhone]     = useState("");
  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [name,      setName]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sentTo,    setSentTo]    = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Already logged in → go to dashboard
  useEffect(() => { if (isLoggedIn) navigate("/dashboard"); }, [isLoggedIn]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!phone.trim()) { setError("Please enter your phone number"); return; }
    setLoading(true); setError("");
    try {
      const res = await customerSendOtp(phone.trim());
      setSentTo(res.phone);
      setStep("otp");
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e: any) {
      setError(e.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 1);
    const next    = [...otp];
    next[i]       = cleaned;
    setOtp(next);
    setError("");
    if (cleaned && i < 5) otpRefs.current[i + 1]?.focus();
    if (!cleaned && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "Enter") handleVerify();
  };

  // ── Step 2: Verify OTP → login → redirect ────────────────────────────────
  const handleVerify = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) { setError("Enter the complete 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      // Pass name if entered (optional — user can fill profile later)
      const data = await customerVerifyOtp(sentTo, otpStr, name.trim() || undefined);

      // Always login and redirect — name can be updated in profile
      login({
        token: data.token,
        phone: data.phone,
        name:  data.name || name.trim() || "Customer",
      });

      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Invalid OTP");
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    await handleSendOtp();
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{ background: "#0f172a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 16 }}>E</div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>RepairHub</span>
        </Link>
        <Link to="/book" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>Book a Repair →</Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.10)", overflow: "hidden" }}>

            {/* Header gradient */}
            <div style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", padding: "32px 32px 28px" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{step === "phone" ? "📱" : "🔐"}</div>
              <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>
                {step === "phone" ? "Welcome back!" : "Verify your number"}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, margin: 0 }}>
                {step === "phone"
                  ? "Sign in to track repairs, view history & more"
                  : `We sent a 6-digit code to ${sentTo}`}
              </p>
            </div>

            <div style={{ padding: "28px 32px 32px" }}>

              {step === "phone" ? (
                /* ── Phone step ── */
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                      Phone Number
                    </label>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" as const }}>
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setError(""); }}
                        onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                        placeholder="10-digit mobile number"
                        autoFocus
                        style={{ flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
                      />
                    </div>
                  </div>

                  {error && (
                    <p style={{ fontSize: 13, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", margin: 0 }}>
                      ❌ {error}
                    </p>
                  )}

                  <button onClick={handleSendOtp} disabled={loading}
                    style={{ padding: "14px", border: "none", borderRadius: 14, background: loading ? "#94a3b8" : "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(249,115,22,0.4)" }}>
                    {loading ? "Sending OTP..." : "Send OTP →"}
                  </button>

                  <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", margin: 0 }}>
                    New here?{" "}
                    <Link to="/book" style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>
                      Book your first repair
                    </Link>
                  </p>
                </div>

              ) : (
                /* ── OTP step ── */
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* OTP boxes */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                      6-Digit OTP
                    </label>
                    <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleKeyDown(i, e)}
                          onPaste={handleOtpPaste}
                          style={{
                            width: 46, height: 52, textAlign: "center" as const,
                            fontSize: 22, fontWeight: 800,
                            border: `2px solid ${digit ? "#f97316" : "#e2e8f0"}`,
                            borderRadius: 12, outline: "none",
                            background: digit ? "#fff7ed" : "#f8fafc",
                            color: "#1e293b", transition: "all .15s",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Name (optional) */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                      Your Name <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none" as const }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="How should we call you?"
                      style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
                    />
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>
                      Skip if you've booked with us before — we'll auto-fill it
                    </p>
                  </div>

                  {error && (
                    <p style={{ fontSize: 13, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", margin: 0 }}>
                      ❌ {error}
                    </p>
                  )}

                  <button onClick={handleVerify} disabled={loading}
                    style={{ padding: "14px", border: "none", borderRadius: 14, background: loading ? "#94a3b8" : "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(249,115,22,0.4)" }}>
                    {loading ? "Verifying..." : "Verify & Go to Dashboard ✓"}
                  </button>

                  {/* Resend + back */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {countdown > 0 ? (
                      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Resend in {countdown}s</p>
                    ) : (
                      <button onClick={handleResend}
                        style={{ fontSize: 13, color: "#f97316", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                        Resend OTP
                      </button>
                    )}
                    <button onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); }}
                      style={{ fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      ← Change number
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Benefits row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
            {[
              { icon: "📦", text: "Track all repairs" },
              { icon: "📸", text: "View repair photos" },
              { icon: "💬", text: "Approve services" },
            ].map(b => (
              <div key={b.text} style={{ background: "#fff", borderRadius: 14, padding: "14px 12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{b.icon}</div>
                <p style={{ fontSize: 11, color: "#64748b", margin: 0, fontWeight: 600 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
