import { useEffect, useState } from "react";
import {
  User, Phone, Mail, RefreshCw, CheckCircle2,
  MapPin, Shield, Package, Truck, TrendingUp, Hash,
} from "lucide-react";
import { getMyProfile, getMyStats } from "../../services/delivery.api.js";
import "./Profile.css";

function StatCard({ label, value, color, bg, loading }) {
  return (
    <div className="pf-stat" style={{ background: bg }}>
      <p className="pf-stat-val" style={{ color }}>{loading ? "—" : value}</p>
      <p className="pf-stat-lbl">{label}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="pf-info-row">
      <div className="pf-info-icon"><Icon size={15} /></div>
      <div>
        <p className="pf-info-lbl">{label}</p>
        <p className="pf-info-val">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const load = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([getMyProfile(), getMyStats()]);
      setProfile(p); setStats(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const name    = profile?.name     ?? user.name     ?? "Agent";
  const initial = name.charAt(0).toUpperCase();
  const rate    = stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="pf-root">

      {/* Header */}
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">My Profile</h1>
          <p className="pf-subtitle">Delivery agent account details</p>
        </div>
        <button className="pf-refresh-btn" onClick={load}>
          <RefreshCw size={13} className={loading ? "pf-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Avatar banner */}
      <div className="pf-banner">
        <div className="pf-avatar">{initial}</div>
        <div className="pf-banner-info">
          <h2 className="pf-name">{name}</h2>
          <p className="pf-role">Delivery Agent · E-RepairHub</p>
          <span className="pf-status-pill">
            <CheckCircle2 size={11} />
            {profile?.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Contact card */}
      <div className="pf-card">
        <h3 className="pf-card-title">Contact Information</h3>
        <div className="pf-info-list">
          <InfoRow icon={Hash}   label="Username" value={profile?.username ?? user.username} />
          <InfoRow icon={Mail}   label="Email"    value={profile?.email    ?? user.email} />
          <InfoRow icon={Phone}  label="Phone"    value={profile?.phone    ?? "Not set"} />
          {profile?.city && <InfoRow icon={MapPin} label="City" value={profile.city} />}
        </div>
      </div>

      {/* Performance stats */}
      <div className="pf-card">
        <h3 className="pf-card-title">Performance Summary</h3>
        <div className="pf-stats-grid">
          <StatCard label="Total Tasks"   value={stats?.total     ?? 0} color="#7C3AED" bg="#EDE9FE" loading={loading} />
          <StatCard label="Completed"     value={stats?.completed ?? 0} color="#16A34A" bg="#F0FDF4" loading={loading} />
          <StatCard label="Active"        value={stats?.active    ?? 0} color="#C2410C" bg="#FFF7ED" loading={loading} />
          <StatCard label="Today Done"    value={stats?.completedToday ?? 0} color="#0369A1" bg="#E0F2FE" loading={loading} />
        </div>

        {/* Breakdown */}
        <div className="pf-breakdown">
          {[
            { icon: Package, label: "Pickups",   value: stats?.pickup   ?? 0, color: "#7C3AED", bg: "#EDE9FE" },
            { icon: Truck,   label: "Deliveries",value: stats?.delivery ?? 0, color: "#059669", bg: "#ECFDF5" },
          ].map(b => (
            <div key={b.label} className="pf-breakdown-item" style={{ background: b.bg }}>
              <b.icon size={16} color={b.color} />
              <p className="pf-breakdown-val" style={{ color: b.color }}>{loading ? "—" : b.value}</p>
              <p className="pf-breakdown-lbl">{b.label}</p>
            </div>
          ))}
        </div>

        {/* Success rate bar */}
        {!loading && stats?.total > 0 && (
          <div className="pf-rate">
            <div className="pf-rate-head">
              <span className="pf-rate-label"><TrendingUp size={13} /> Success Rate</span>
              <span className="pf-rate-pct">{rate}%</span>
            </div>
            <div className="pf-rate-track">
              <div className="pf-rate-fill" style={{ width: `${rate}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="pf-card pf-account">
        <Shield size={14} />
        <p>Your account is managed by E-RepairHub. Contact your administrator to update account details.</p>
      </div>

    </div>
  );
}