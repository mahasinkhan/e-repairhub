import { useState } from "react";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Zap,
  Settings, ChevronDown, MapPin, Smartphone, Check,
  LayoutDashboard, Truck
} from "lucide-react";

const roles = [
  {
    id: "admin",
    label: "Admin",
    icon: <Shield size={18} className="text-blue-500" />,
    desc: "Access admin dashboard and manage system",
  },
  {
    id: "franchise",
    label: "Franchise",
    icon: <LayoutDashboard size={18} className="text-emerald-500" />,
    desc: "Manage repair center and orders",
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: <Truck size={18} className="text-orange-400" />,
    desc: "Manage pickups and deliveries",
  },
];

const features = [
  {
    icon: <Shield size={20} className="text-blue-400" />,
    title: "Role Based Access",
    desc: "Secure dashboards for Admin, Franchise & Delivery teams.",
  },
  {
    icon: <Zap size={20} className="text-yellow-400" />,
    title: "Real-time Updates",
    desc: "Live tracking, order updates and instant notifications.",
  },
  {
    icon: <Settings size={20} className="text-purple-400" />,
    title: "Smart Management",
    desc: "Streamline repair workflow and team collaboration.",
  },
  {
    icon: <Lock size={20} className="text-green-400" />,
    title: "Data Security",
    desc: "Your data is protected with advanced security.",
  },
];

/* ── tiny SVG dashboard mockup ─────────────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* glow under card */}
      <div className="absolute inset-0 translate-y-6 scale-95 rounded-2xl bg-blue-600/30 blur-2xl" />

      {/* main laptop card */}
      <div className="relative rounded-2xl border border-white/10 bg-[#0d1b3e]/90 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 mx-4 h-4 rounded-full bg-white/10 flex items-center px-2">
            <span className="text-[9px] text-white/30">dashboard.erepairhub.com</span>
          </div>
        </div>

        <div className="flex">
          {/* sidebar */}
          <div className="hidden sm:flex flex-col w-28 border-r border-white/10 bg-white/[0.03] p-3 gap-1">
            {["Dashboard","Orders","Customers","Technicians","Reports","Settings"].map((item, i) => (
              <div key={item}
                className={`text-[9px] px-2 py-1.5 rounded-md cursor-pointer transition-all ${i === 0 ? "bg-blue-600/80 text-white font-semibold" : "text-white/40 hover:text-white/70"}`}>
                {item}
              </div>
            ))}
          </div>

          {/* content */}
          <div className="flex-1 p-4">
            <p className="text-white/80 text-xs font-semibold mb-3">Dashboard</p>

            {/* stat cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Total Orders", val: "1,248", change: "+12.5%", color: "text-blue-400" },
                { label: "In Progress",  val: "342",   change: "+8.2%",  color: "text-blue-400" },
                { label: "Completed",    val: "892",   change: "+14.1%", color: "text-green-400" },
              ].map(s => (
                <div key={s.label} className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-[8px] text-white/40 mb-1">{s.label}</p>
                  <p className="text-sm font-bold text-white">{s.val}</p>
                  <p className={`text-[8px] ${s.color}`}>{s.change}</p>
                </div>
              ))}
            </div>

            {/* chart placeholder */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[9px] text-white/60 font-medium">Orders Overview</p>
                <span className="text-[8px] text-white/30 border border-white/10 rounded px-1.5 py-0.5">This Month</span>
              </div>
              {/* bar chart */}
              <div className="flex items-end gap-1 h-12">
                {[30,50,40,70,55,80,65,90,60,75,85,100].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm"
                    style={{ height: `${h}%`, background: i === 11 ? "#3b82f6" : `rgba(59,130,246,${0.2 + i * 0.05})` }} />
                ))}
              </div>
            </div>

            {/* recent orders */}
            <div className="space-y-1.5">
              <p className="text-[9px] text-white/50 font-medium mb-2">Recent Orders</p>
              {[
                { id: "#ERH1256", name: "iPhone 13 Screen Replacement", status: "In Progress", color: "text-blue-400" },
                { id: "#ERH1255", name: "MacBook Battery Replacement",  status: "Completed",  color: "text-green-400" },
                { id: "#ERH1254", name: "Samsung S21 Screen Replacement", status: "Pending",  color: "text-yellow-400" },
              ].map(o => (
                <div key={o.id} className="flex items-center justify-between">
                  <span className="text-[8px] text-white/40">{o.id}</span>
                  <span className="text-[8px] text-white/60 flex-1 mx-2 truncate">{o.name}</span>
                  <span className={`text-[8px] ${o.color}`}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating phone card */}
      <div className="absolute -left-6 -bottom-4 w-28 rounded-xl border border-white/10 bg-[#0d1b3e]/95 shadow-xl p-3 hidden md:block">
        <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center mb-2">
          <Smartphone size={14} className="text-blue-400" />
        </div>
        <p className="text-[8px] text-white font-semibold">Order #ERH1256</p>
        <p className="text-[7px] text-white/50">Pick up the device</p>
        <p className="text-[7px] text-blue-400 mt-0.5">2.4 km away</p>
        <div className="mt-2 w-full bg-blue-600 rounded text-[7px] text-center text-white py-0.5">View Details</div>
      </div>

      {/* floating pin */}
      <div className="absolute -right-3 -top-4 hidden md:flex flex-col items-center gap-0.5 animate-bounce" style={{ animationDuration: "2.5s" }}>
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
          <MapPin size={12} className="text-white" fill="white" />
        </div>
        <div className="w-px h-3 bg-blue-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export default function ERepairHubLogin({
  onSubmit,
  loading = false,
  error: serverError = "",
  /** When set (e.g. "delivery"), role dropdown starts with this option selected. */
  initialRole = null,
}) {
  const [showPass, setShowPass]     = useState(false);
  const [roleOpen, setRoleOpen]     = useState(false);
  const [selectedRole, setRole]     = useState(initialRole);
  const [remember, setRemember]     = useState(true);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [localError, setLocalError]   = useState("");

  const displayError = serverError || localError;

  async function handleLogin(e) {
    e.preventDefault();
    setLocalError("");
    if (!email.trim()) {
      setLocalError("Please enter email or username.");
      return;
    }
    if (!password) {
      setLocalError("Please enter password.");
      return;
    }
    if (!selectedRole) {
      setLocalError("Please select a role.");
      return;
    }
    if (typeof onSubmit === "function") {
      await onSubmit({
        emailOrUsername: email.trim(),
        password,
        role: selectedRole,
      });
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#060d1f] flex flex-col lg:flex-row font-[system-ui]">

      {/* ── LEFT — branding ─────────────────────────────────────────── */}
      <div className="relative lg:w-[55%] flex flex-col justify-between overflow-hidden
                      bg-gradient-to-br from-[#060d1f] via-[#081436] to-[#0a1a4a]
                      px-6 sm:px-10 lg:px-16 pt-8 pb-10 lg:py-12">

        {/* background grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)`,
            backgroundSize: "48px 48px"
          }} />

        {/* radial glow */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-700/10 rounded-full blur-2xl pointer-events-none" />

        {/* logo */}
        <div className="relative flex items-center gap-3 mb-6 lg:mb-0">
          <div className="w-10 h-10 rounded-xl border border-blue-500/40 bg-blue-600/20 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Smartphone size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">
              E-Repair<span className="text-blue-400">Hub</span>
            </p>
            <p className="text-white/40 text-[10px] leading-tight mt-0.5">Unified Repair Management System</p>
          </div>
        </div>

        {/* headline */}
        <div className="relative z-10 mt-8 lg:mt-0">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold align-center text-white leading-tight tracking-tight">
            One Platform.<br />
            Complete{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Repair Solution.
            </span>
          </h2>
          
        </div>

        {/* dashboard illustration */}
        <div className="relative z-10 my-8 lg:my-10">
          <DashboardMockup />
        </div>

        {/* feature grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {features.map(f => (
            <div key={f.title}
              className="flex items-start gap-3 rounded-xl bg-white/[0.04] border border-white/[0.07]
                         hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 p-3">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-tight">{f.title}</p>
                <p className="text-white/40 text-[10px] leading-snug mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — login card ─────────────────────────────────────── */}
      <div className="lg:w-[45%] flex items-center justify-center
                      bg-gradient-to-br from-[#f0f4ff] via-white to-[#e8f0fe]
                      px-4 sm:px-8 py-10 lg:py-12">

        <div className="w-full max-w-md">
          {/* card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-100/80
                          border border-white p-8 sm:p-10">

            {/* icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl border-2 border-blue-100 bg-blue-50
                              flex items-center justify-center shadow-lg shadow-blue-100">
                <Smartphone size={26} className="text-blue-600" />
              </div>
            </div>

            {/* heading */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welcome Back!</h2>
              <p className="text-gray-500 text-sm mt-1.5">Login to continue to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {displayError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {displayError}
                </div>
              ) : null}

              {/* email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email / Username</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter email or username"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    className="m-0 w-full appearance-none pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/80
                               text-gray-900 text-sm placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                               transition-all duration-200"
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className="m-0 w-full appearance-none pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/80
                               text-gray-900 text-sm placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                               transition-all duration-200"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-gray-400
                               outline-none hover:text-gray-600 focus:outline-none focus-visible:ring-2
                               focus-visible:ring-blue-500/30 focus-visible:ring-offset-0 rounded-md transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* role dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Role</label>
                <div className="relative">
                  <button type="button"
                    disabled={loading}
                    onClick={() => setRoleOpen(v => !v)}
                    className="m-0 w-full flex cursor-pointer items-center justify-between border border-gray-200
                               bg-gray-50/80 pl-3.5 pr-4 py-3 text-left text-sm text-gray-900 shadow-none
                               outline-none transition-all duration-200 hover:border-gray-300
                               focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                               disabled:cursor-not-allowed disabled:opacity-60 rounded-xl">
                    <div className="flex items-center gap-2">
                      {selectedRole
                        ? <>{roles.find(r => r.id === selectedRole)?.icon}<span className="text-gray-800 font-medium">{roles.find(r => r.id === selectedRole)?.label}</span></>
                        : <><div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-200" /><span className="text-gray-400">Choose your role</span></>
                      }
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${roleOpen ? "rotate-180" : ""}`} />
                  </button>

                  {roleOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl
                                    border border-gray-100 shadow-xl shadow-gray-200/80 z-50 overflow-hidden">
                      {roles.map(r => (
                        <button key={r.id} type="button"
                          onClick={() => { setRole(r.id); setRoleOpen(false); }}
                          className={`m-0 w-full cursor-pointer border-0 bg-white text-left shadow-none outline-none
                                      flex items-center gap-3 px-4 py-3 transition-colors
                                      focus:outline-none focus-visible:bg-blue-50/80
                                      hover:bg-blue-50/80 ${selectedRole === r.id ? "bg-blue-50" : ""}`}>
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            {r.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                            <p className="text-xs text-gray-400">{r.desc}</p>
                          </div>
                          {selectedRole === r.id && (
                            <Check size={14} className="ml-auto text-blue-500 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* remember + forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div onClick={() => setRemember(v => !v)}
                    className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center
                                ${remember ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
                    {remember && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  className="m-0 border-0 bg-transparent p-0 text-sm font-medium text-blue-600 shadow-none outline-none
                             transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2
                             focus-visible:ring-blue-500/35 focus-visible:ring-offset-0 rounded"
                >
                  Forgot Password?
                </button>
              </div>

              {/* login button */}
              <button type="submit"
                disabled={loading}
                className="relative m-0 w-full cursor-pointer overflow-hidden border-0 py-3.5 text-sm font-semibold
                           text-white shadow-lg shadow-blue-500/30 outline-none transition-all duration-200
                           flex items-center justify-center gap-2 group rounded-xl
                           bg-gradient-to-r from-blue-600 to-blue-500
                           hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-500/50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2
                           active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button"
                className="m-0 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200
                           bg-white py-2.5 px-4 text-sm font-medium text-gray-700 shadow-sm outline-none
                           transition-all duration-200 hover:border-gray-300 hover:bg-gray-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 active:scale-[0.98]">
                {/* Google G */}
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button"
                className="m-0 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200
                           bg-white py-2.5 px-4 text-sm font-medium text-gray-700 shadow-sm outline-none
                           transition-all duration-200 hover:border-gray-300 hover:bg-gray-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 active:scale-[0.98]">
                {/* Microsoft */}
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </button>
            </div>

            {/* contact admin */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <button
                type="button"
                className="m-0 border-0 bg-transparent p-0 font-semibold text-blue-600 shadow-none outline-none
                           transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2
                           focus-visible:ring-blue-500/35 focus-visible:ring-offset-0 rounded"
              >
                Contact Admin
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}