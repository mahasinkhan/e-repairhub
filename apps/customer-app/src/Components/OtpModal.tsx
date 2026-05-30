import React, { useEffect, useRef, useState } from "react";

const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

interface OtpModalProps {
  open:    boolean;
  phone:   string;
  onClose: () => void;
  onVerified: () => void;
}

export default function OtpModal({ open, phone, onClose, onVerified }: OtpModalProps) {
  const [step,      setStep]      = useState<"send" | "verify">("send");
  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef  = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (open) {
      setStep("send");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setSuccess("");
      setCountdown(0);
    }
    return () => clearInterval(timerRef.current);
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  // Auto-focus first OTP input when entering verify step
  useEffect(() => {
    if (step === "verify") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  if (!open) return null;

  const handleSendOtp = async () => {
    if (!phone.trim()) { setError("Phone number is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${BASE}/auth/send-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSuccess(data.message);
      setStep("verify");
      setCountdown(60);
    } catch (e: any) {
      setError(e.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextIdx = Math.min(index + digits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    // Auto-submit when all 6 filled
    const filled = newOtp.join("");
    if (filled.length === 6) handleVerifyOtp(filled);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const code = otpValue ?? otp.join("");
    if (code.length !== 6) { setError("Enter all 6 digits"); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${BASE}/auth/verify-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone, otp: code }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSuccess("✅ Phone verified!");
      setTimeout(() => { onVerified(); onClose(); }, 800);
    } catch (e: any) {
      setError(e.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(15,23,42,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 24,
        width: "100%", maxWidth: 400,
        boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "24px 28px" }}>
          <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>📱</div>
          <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0, textAlign: "center" }}>
            {step === "send" ? "Verify Your Phone" : "Enter OTP"}
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "6px 0 0", textAlign: "center" }}>
            {step === "send"
              ? `We'll send a 6-digit code to ${phone}`
              : `Code sent to ${phone.slice(0, 3)}****${phone.slice(-2)}`
            }
          </p>
        </div>

        <div style={{ padding: "28px" }}>
          {/* STEP 1 — Send OTP */}
          {step === "send" && (
            <div>
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>📞</span>
                <div>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Phone Number</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "2px 0 0" }}>{phone}</p>
                </div>
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                  <p style={{ color: "#b91c1c", fontSize: 13, margin: 0 }}>❌ {error}</p>
                </div>
              )}

              <button onClick={handleSendOtp} disabled={loading}
                style={{
                  width: "100%", padding: "14px",
                  background: loading ? "#94a3b8" : "linear-gradient(135deg, #f97316, #ea580c)",
                  border: "none", borderRadius: 12, color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(249,115,22,0.4)",
                }}>
                {loading ? "⏳ Sending OTP..." : "📲 Send OTP via SMS"}
              </button>

              <button onClick={onClose}
                style={{ width: "100%", padding: "12px", background: "none", border: "none", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
                Cancel
              </button>
            </div>
          )}

          {/* STEP 2 — Enter OTP */}
          {step === "verify" && (
            <div>
              {success && !error && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, textAlign: "center" }}>
                  <p style={{ color: "#15803d", fontSize: 13, margin: 0 }}>✅ {success}</p>
                </div>
              )}

              {/* OTP input boxes */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    style={{
                      width: 48, height: 56,
                      textAlign: "center", fontSize: 22, fontWeight: 800,
                      border: `2.5px solid ${digit ? "#f97316" : "#e2e8f0"}`,
                      borderRadius: 12, outline: "none",
                      background: digit ? "#fff7ed" : "#fff",
                      color: "#1e293b",
                      transition: "all .15s",
                    }}
                  />
                ))}
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                  <p style={{ color: "#b91c1c", fontSize: 13, margin: 0, textAlign: "center" }}>❌ {error}</p>
                </div>
              )}

              <button onClick={() => handleVerifyOtp()} disabled={loading || otp.join("").length !== 6}
                style={{
                  width: "100%", padding: "14px",
                  background: (loading || otp.join("").length !== 6) ? "#e2e8f0" : "linear-gradient(135deg, #f97316, #ea580c)",
                  border: "none", borderRadius: 12, color: (loading || otp.join("").length !== 6) ? "#94a3b8" : "#fff",
                  fontSize: 15, fontWeight: 700,
                  cursor: (loading || otp.join("").length !== 6) ? "not-allowed" : "pointer",
                  boxShadow: otp.join("").length === 6 ? "0 4px 14px rgba(249,115,22,0.4)" : "none",
                }}>
                {loading ? "⏳ Verifying..." : "✅ Verify OTP"}
              </button>

              {/* Resend */}
              <div style={{ textAlign: "center", marginTop: 16 }}>
                {countdown > 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>
                    Resend OTP in <span style={{ color: "#f97316", fontWeight: 700 }}>{countdown}s</span>
                  </p>
                ) : (
                  <button onClick={() => { setStep("send"); setOtp(["","","","","",""]); setError(""); setSuccess(""); }}
                    style={{ background: "none", border: "none", color: "#f97316", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    🔄 Resend OTP
                  </button>
                )}
              </div>

              <button onClick={onClose}
                style={{ width: "100%", padding: "10px", background: "none", border: "none", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}