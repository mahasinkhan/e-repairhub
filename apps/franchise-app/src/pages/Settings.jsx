import { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Bell, Shield, User, Save } from "lucide-react";

export default function Settings() {
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } })();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({ orderUpdates: true, earnings: true, system: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Card = ({ title, icon: Icon, children }) => (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 18 }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 18 }}>
        <Icon size={16} color="#64748b" /> {title}
      </h3>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{desc}</p>}
      </div>
      <button onClick={onChange} style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: checked ? "#3b82f6" : "#e2e8f0", position: "relative", transition: "background .2s",
      }}>
        <span style={{
          position: "absolute", top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: "50%", background: "#fff",
          transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );

  return (
    <div className="content-shell" style={{ padding: "24px 28px", maxWidth: 600 }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Manage your franchise panel preferences</p>
      </div>

      {/* Account info */}
      <Card title="Account" icon={User}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 0 16px" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20 }}>
            {user.name?.charAt(0)?.toUpperCase() ?? "F"}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", margin: 0 }}>{user.name ?? "Franchise User"}</p>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{user.email}</p>
            <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Franchise</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
          {[["Username", user.username ?? "—"], ["Role", "Franchise"]].map(([label, val]) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{val}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Appearance */}
      <Card title="Appearance" icon={darkMode ? Moon : Sun}>
        <Toggle
          label="Dark Mode"
          desc="Switch to dark theme (coming soon)"
          checked={darkMode}
          onChange={() => setDarkMode(d => !d)}
        />
      </Card>

      {/* Notifications */}
      <Card title="Notifications" icon={Bell}>
        <Toggle
          label="Order Updates"
          desc="Get notified when orders are assigned or status changes"
          checked={notifications.orderUpdates}
          onChange={() => setNotifications(n => ({ ...n, orderUpdates: !n.orderUpdates }))}
        />
        <Toggle
          label="Earnings Alerts"
          desc="Get notified about commission and payment updates"
          checked={notifications.earnings}
          onChange={() => setNotifications(n => ({ ...n, earnings: !n.earnings }))}
        />
        <Toggle
          label="System Alerts"
          desc="Get notified about system maintenance and updates"
          checked={notifications.system}
          onChange={() => setNotifications(n => ({ ...n, system: !n.system }))}
        />
      </Card>

      {/* Security */}
      <Card title="Security" icon={Shield}>
        <div style={{ padding: "8px 0" }}>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
            To change your password, contact your admin or use the user management panel.
          </p>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 13, color: "#15803d", fontWeight: 600, margin: 0 }}>✓ Your account is secure</p>
            <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>Logged in as {user.email}</p>
          </div>
        </div>
      </Card>

      {/* Save */}
      <button onClick={handleSave} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "12px 24px",
        background: saved ? "#22c55e" : "#1d4ed8", color: "#fff",
        border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
        cursor: "pointer", transition: "background .2s", boxShadow: "0 2px 8px rgba(29,78,216,0.3)",
      }}>
        <Save size={16} />
        {saved ? "Saved!" : "Save Preferences"}
      </button>
    </div>
  );
}