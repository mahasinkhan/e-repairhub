import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Truck, Loader2 } from "lucide-react";
import { login } from "../services/auth.api.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.emailOrUsername.trim()) return setError("Email or username is required");
    if (!form.password.trim()) return setError("Password is required");
    setLoading(true);
    try {
      const { token, user } = await login(form);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: "#f97316", borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
          }}>
            <Truck size={28} color="#fff" />
          </div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>E-RepairHub</h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Delivery Agent Portal</p>
        </div>

        <div style={{
          background: "#1e293b", border: "1px solid #334155",
          borderRadius: 20, padding: "32px 28px",
        }}>
          <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 24 }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
                Email or Username
              </label>
              <input
                type="text" value={form.emailOrUsername}
                onChange={e => setForm(p => ({ ...p, emailOrUsername: e.target.value }))}
                placeholder="delivery@erepairhub.com"
                style={{
                  width: "100%", background: "#0f172a", border: "1px solid #334155",
                  borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter password"
                  style={{
                    width: "100%", background: "#0f172a", border: "1px solid #334155",
                    borderRadius: 10, padding: "10px 40px 10px 14px", color: "#fff", fontSize: 14,
                    outline: "none", boxSizing: "border-box",
                  }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#64748b",
                }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "10px 14px",
              }}>
                <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: loading ? "#64748b" : "#f97316", border: "none",
              borderRadius: 10, padding: "12px 0", color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 4,
            }}>
              {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #334155", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#475569" }}>
              Demo: <span style={{ color: "#94a3b8" }}>delivery@erepairhub.com</span> / <span style={{ color: "#94a3b8" }}>delivery123</span>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}