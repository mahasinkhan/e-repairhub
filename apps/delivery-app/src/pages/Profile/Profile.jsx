import { useEffect, useState } from "react";
import { User, Phone, Mail, RefreshCw, CheckCircle } from "lucide-react";
import { getMyProfile, getMyStats } from "../../services/delivery.api.js";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();

  useEffect(() => {
    Promise.all([getMyProfile(), getMyStats()])
      .then(([p, s]) => { setProfile(p); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", paddingTop: 60 }}>
      <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>Profile</h1>

      {/* Avatar card */}
      <div style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", borderRadius: 18, padding: "24px", marginBottom: 16, color: "#fff", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800 }}>
          {user.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{profile?.name ?? user.name}</h2>
          <p style={{ fontSize: 13, opacity: 0.8, margin: "4px 0 0" }}>Delivery Agent · E-RepairHub</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.2)", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600, marginTop: 6 }}>
            <CheckCircle size={11} /> {profile?.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Contact */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px", marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 14, textTransform: "uppercase" }}>Contact</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: User,  label: "Username", value: profile?.username ?? user.username },
            { icon: Mail,  label: "Email",    value: profile?.email ?? user.email },
            { icon: Phone, label: "Phone",    value: profile?.phone || "Not set" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, background: "#fff7ed", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color="#f97316" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, textTransform: "uppercase" }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 14, textTransform: "uppercase" }}>Performance</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Total",     value: stats.total,     color: "#7c3aed", bg: "#f5f3ff" },
              { label: "Completed", value: stats.completed, color: "#15803d", bg: "#f0fdf4" },
              { label: "Active",    value: stats.active,    color: "#c2410c", bg: "#fff7ed" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "12px", textAlign: "center" }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
          {stats.total > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                <span>Success Rate</span>
                <span style={{ fontWeight: 700, color: "#15803d" }}>{Math.round((stats.completed / stats.total) * 100)}%</span>
              </div>
              <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.round((stats.completed / stats.total) * 100)}%`, background: "linear-gradient(90deg, #f97316, #ea580c)", borderRadius: 999 }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}