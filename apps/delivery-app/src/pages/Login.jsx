import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Truck, Loader2, Mail, Lock, ShieldCheck, MapPin, Zap } from "lucide-react";
import { login } from "../services/auth.api.js";
const brandImg = "/login.jpeg";

export default function Login() {
  const navigate = useNavigate();
  const [form,   setForm]   = useState({ emailOrUsername: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading,setLoading]= useState(false);
  const [error,  setError]  = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.emailOrUsername.trim()) return setError("Email or username is required");
    if (!form.password.trim())        return setError("Password is required");
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
    <div className="erh-root">
      <Styles />

      <div className="erh-shell">
        {/* LEFT — Brand / image */}
        <aside className="erh-brand">
          <img src={brandImg} alt="E-Repair Shop workbench" className="erh-brand-img" />
          <div className="erh-brand-overlay" aria-hidden="true" />
          <div className="erh-brand-content">
            <div className="erh-brand-top">
              <div className="erh-logo">
                <Truck size={22} color="#fff" strokeWidth={2.4} />
              </div>
              <span className="erh-wordmark">E-RepairHub</span>
            </div>
            <div className="erh-brand-mid">
              <p className="erh-eyebrow">Delivery Agent Portal</p>
              <h2 className="erh-headline">
                Every device,<br />delivered with <span>care</span>.
              </h2>
              <p className="erh-sub">
                Pick up, track and hand off repair jobs in real time — one secure
                dashboard for the people on the road.
              </p>
            </div>
            <ul className="erh-trust">
              <li><ShieldCheck size={15} /> Secure handoffs</li>
              <li><MapPin size={15} />     Live GPS tracking</li>
              <li><Zap size={15} />        Instant job sync</li>
            </ul>
          </div>
        </aside>

        {/* RIGHT — White login panel */}
        <main className="erh-panel">
          <div className="erh-form-wrap">
            <div className="erh-card-head">
              <div className="erh-logo erh-logo-sm">
                <Truck size={18} color="#fff" strokeWidth={2.4} />
              </div>
              <div>
                <h1 className="erh-title">Welcome back</h1>
                <p className="erh-title-sub">Sign in to your agent account</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="erh-form">
              <div className="erh-field">
                <label htmlFor="erh-id">Email or Username</label>
                <div className="erh-input-wrap">
                  <Mail size={16} className="erh-input-ico" />
                  <input id="erh-id" type="text" value={form.emailOrUsername}
                    onChange={e => setForm(p => ({ ...p, emailOrUsername: e.target.value }))}
                    placeholder="delivery@erepairhub.com" autoComplete="username" />
                </div>
              </div>

              <div className="erh-field">
                <label htmlFor="erh-pw">Password</label>
                <div className="erh-input-wrap">
                  <Lock size={16} className="erh-input-ico" />
                  <input id="erh-pw" type={showPw ? "text" : "password"} value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password" autoComplete="current-password"
                    className="erh-input-pw" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="erh-eye" aria-label={showPw ? "Hide" : "Show"}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="erh-error" role="alert">
                  <span className="erh-error-dot" />
                  <p>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="erh-submit">
                {loading && <Loader2 size={16} className="erh-spin" />}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="erh-demo">
              <span className="erh-demo-tag">Demo</span>
              <span className="erh-demo-cred">delivery@erepairhub.com</span>
              <span className="erh-demo-sep">/</span>
              <span className="erh-demo-cred">delivery123</span>
            </div>
            <p className="erh-foot">© {new Date().getFullYear()} E-RepairHub · Delivery Operations</p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.erh-root *{ box-sizing:border-box; }

.erh-root{
  position:relative;
  width:100%; height:100vh;
  overflow:hidden;
  background:#ffffff;
  font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif;
}

/* ── Full-screen 50/50 shell ── */
.erh-shell{
  width:100%; height:100vh;
  display:grid;
  grid-template-columns:1fr 1fr;
  animation:erh-rise .6s cubic-bezier(.2,.8,.2,1) both;
}
@keyframes erh-rise{
  from{ opacity:0; transform:translateY(12px); }
  to  { opacity:1; transform:none; }
}

/* ══════════════════════════════
   LEFT — image / brand panel
══════════════════════════════ */
.erh-brand{
  position:relative; overflow:hidden;
  display:flex; flex-direction:column;
  border-right:1px solid rgba(148,163,184,.12);
}

.erh-brand-img{
  position:absolute; inset:0;
  width:100%; height:100%;
  object-fit:cover; object-position:center;
}

.erh-brand-overlay{
  position:absolute; inset:0;
  background:
    linear-gradient(180deg,rgba(7,11,22,.40) 0%,rgba(7,11,22,.30) 40%,rgba(7,11,22,.88) 100%),
    radial-gradient(120% 80% at 0% 0%,rgba(249,115,22,.28),transparent 55%);
}

.erh-brand-content{
  position:relative; z-index:1; flex:1;
  padding:52px 56px;
  display:flex; flex-direction:column; justify-content:space-between; gap:32px;
}

.erh-brand-top{ display:flex; align-items:center; gap:12px; }

.erh-wordmark{
  font-family:'Bricolage Grotesque',sans-serif; font-weight:700;
  font-size:19px; letter-spacing:-.3px; color:#fff;
  text-shadow:0 2px 12px rgba(0,0,0,.5);
}

.erh-logo{
  width:44px; height:44px; border-radius:13px; flex:none;
  background:linear-gradient(145deg,#fb923c,#ea580c);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 8px 22px -6px rgba(249,115,22,.4), inset 0 1px 0 rgba(255,255,255,.25);
}
.erh-logo-sm{ width:40px; height:40px; border-radius:12px; }

.erh-eyebrow{
  font-size:11px; font-weight:700; letter-spacing:2.4px; text-transform:uppercase;
  color:#fb923c; margin:0 0 16px;
}

.erh-headline{
  font-family:'Bricolage Grotesque',sans-serif; font-weight:600;
  font-size:36px; line-height:1.1; letter-spacing:-.8px; color:#fff; margin:0 0 16px;
  text-shadow:0 2px 18px rgba(0,0,0,.55);
}
.erh-headline span{
  color:transparent;
  background:linear-gradient(120deg,#fb923c,#fdba74);
  -webkit-background-clip:text; background-clip:text;
}

.erh-sub{
  font-size:14px; line-height:1.65; color:#cbd5e1; margin:0;
  text-shadow:0 1px 10px rgba(0,0,0,.5);
}

.erh-trust{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:13px; }
.erh-trust li{
  display:flex; align-items:center; gap:10px;
  font-size:13px; font-weight:600; color:#e2e8f0;
  text-shadow:0 1px 8px rgba(0,0,0,.5);
}
.erh-trust li svg{ color:#fb923c; flex:none; }

/* ══════════════════════════════
   RIGHT — white login panel
══════════════════════════════ */
.erh-panel{
  display:flex; align-items:center; justify-content:center;
  background:#ffffff;                  /* ← WHITE */
  padding:48px 56px;
  overflow-y:auto;
}

.erh-form-wrap{
  width:100%;
  max-width:400px;
  display:flex; flex-direction:column;
}

/* Header */
.erh-card-head{
  display:flex; align-items:center; gap:14px; margin-bottom:34px;
}

.erh-title{
  font-family:'Bricolage Grotesque',sans-serif; font-weight:700;
  font-size:24px; letter-spacing:-.5px;
  color:#0f172a;                        /* ← DARK */
  margin:0;
}
.erh-title-sub{
  font-size:13px;
  color:#64748b;                        /* ← MEDIUM GRAY */
  margin:3px 0 0;
}

/* Form */
.erh-form{ display:flex; flex-direction:column; gap:18px; }

.erh-field label{
  display:block; font-size:12px; font-weight:600; letter-spacing:.1px;
  color:#475569;                        /* ← DARK LABEL */
  margin-bottom:8px;
}

.erh-input-wrap{ position:relative; }

.erh-input-ico{
  position:absolute; left:14px; top:50%; transform:translateY(-50%);
  color:#94a3b8;                        /* ← MEDIUM GRAY ICON */
  pointer-events:none; transition:color .2s;
}

.erh-input-wrap input{
  width:100%;
  background:#f8fafc;                   /* ← LIGHT INPUT BG */
  border:1.5px solid #e2e8f0;           /* ← LIGHT BORDER */
  border-radius:12px;
  padding:13px 14px 13px 44px;
  color:#0f172a;                        /* ← DARK TEXT */
  font-size:14px; font-family:inherit; outline:none;
  transition:border-color .2s, box-shadow .2s, background .2s;
}
.erh-input-pw{ padding-right:46px !important; }
.erh-input-wrap input::placeholder{ color:#94a3b8; }
.erh-input-wrap input:focus{
  border-color:#f97316;                 /* ← ORANGE FOCUS */
  background:#ffffff;
  box-shadow:0 0 0 4px rgba(249,115,22,.1);
}
.erh-input-wrap:focus-within .erh-input-ico{ color:#f97316; }

.erh-eye{
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  background:none; border:none; cursor:pointer;
  color:#94a3b8; padding:6px; display:flex;
  border-radius:8px; transition:color .2s, background .2s;
}
.erh-eye:hover{ color:#475569; background:rgba(0,0,0,.06); }

/* Error */
.erh-error{
  display:flex; align-items:center; gap:9px;
  background:#fef2f2; border:1px solid #fecaca;
  border-radius:11px; padding:10px 13px;
  animation:erh-shake .35s ease;
}
.erh-error-dot{
  width:7px; height:7px; border-radius:50%; background:#f87171; flex:none;
}
.erh-error p{ color:#b91c1c; font-size:13px; margin:0; }
@keyframes erh-shake{
  0%,100%{ transform:translateX(0); }
  25%    { transform:translateX(-5px); }
  75%    { transform:translateX(5px); }
}

/* Submit */
.erh-submit{
  position:relative; overflow:hidden; margin-top:6px;
  background:linear-gradient(145deg,#fb923c,#ea580c);
  border:none; border-radius:12px; padding:14px 0;
  color:#fff; font-size:14.5px; font-weight:700; font-family:inherit; letter-spacing:.2px;
  cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:8px;
  box-shadow:0 8px 24px -8px rgba(249,115,22,.5);
  transition:transform .15s, box-shadow .2s, filter .2s;
}
.erh-submit:hover:not(:disabled){
  transform:translateY(-1px);
  box-shadow:0 14px 30px -8px rgba(249,115,22,.55);
  filter:brightness(1.05);
}
.erh-submit:active:not(:disabled){ transform:translateY(0); }
.erh-submit::after{
  content:""; position:absolute; inset:0; transform:translateX(-120%);
  background:linear-gradient(110deg,transparent,rgba(255,255,255,.28),transparent);
}
.erh-submit:hover:not(:disabled)::after{ animation:erh-shine .8s ease; }
.erh-submit:disabled{ background:#e2e8f0; cursor:not-allowed; box-shadow:none; color:#94a3b8; }
@keyframes erh-shine{ to{ transform:translateX(120%); } }

.erh-spin{ animation:erh-rot 1s linear infinite; }
@keyframes erh-rot{ to{ transform:rotate(360deg); } }

/* Demo credentials */
.erh-demo{
  display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  margin-top:28px; padding-top:22px;
  border-top:1px solid #f1f5f9;        /* ← LIGHT DIVIDER */
}
.erh-demo-tag{
  font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
  color:#f97316; background:rgba(249,115,22,.08); border:1px solid rgba(249,115,22,.2);
  padding:3px 9px; border-radius:6px;
}
.erh-demo-cred{ font-size:12px; color:#64748b; font-family:ui-monospace,monospace; }
.erh-demo-sep { color:#cbd5e1; }

.erh-foot{
  text-align:center; font-size:11px;
  color:#94a3b8;                        /* ← LIGHT GRAY */
  margin-top:18px;
}

/* ── Responsive ── */
@media (max-width:860px){
  .erh-shell{
    grid-template-columns:1fr;
    height:auto; min-height:100vh; overflow-y:auto;
  }
  .erh-brand{
    min-height:260px; max-height:35vh;
    border-right:none; border-bottom:1px solid #e2e8f0;
  }
  .erh-brand-content{ padding:26px 26px; gap:16px; }
  .erh-headline{ font-size:24px; }
  .erh-panel{ padding:36px 28px; align-items:flex-start; }
  .erh-form-wrap{ max-width:100%; }
}

@media (max-width:480px){
  .erh-brand-content{ padding:22px 20px; }
  .erh-panel{ padding:28px 20px; }
  .erh-headline{ font-size:21px; }
}

@media (prefers-reduced-motion:reduce){
  .erh-shell, .erh-submit::after{ animation:none !important; }
}
    `}</style>
  );
}