import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuth";
import { customerGetOrders, customerUpdateProfile } from "../services/api";
import Footer from "../Components/Footer";

function initials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function Profile() {
  const { customer, isLoggedIn, logout, updateName } = useCustomerAuth();
  const navigate = useNavigate();

  const [name,    setName]    = useState(customer?.name || "");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    setName(customer?.name || "");
    customerGetOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoggedIn, customer?.name]);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name cannot be empty"); return; }
    setSaving(true); setError("");
    try {
      const data = await customerUpdateProfile(name.trim());
      updateName(data.name, data.token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  const totalOrders     = orders.length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const activeOrders    = orders.filter(o => !["delivered","cancelled"].includes(o.status)).length;
  const totalSpent      = orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + (o.price || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Top nav */}
      <div style={{ background: "#0f172a", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 15 }}>E</div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>RepairHub</span>
        </Link>
        <Link to="/dashboard" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ flex: 1, maxWidth: 600, width: "100%", margin: "0 auto", padding: "24px 16px" }}>

        {/* Avatar + name */}
        <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 20, padding: "28px 24px", marginBottom: 20, textAlign: "center", color: "#fff" }}>
          <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 auto 12px" }}>
            {customer?.name ? initials(customer.name) : "?"}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{customer?.name}</h2>
          <p style={{ fontSize: 14, opacity: 0.6, margin: 0 }}>📱 {customer?.phone}</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total",     value: totalOrders,               color: "#1e293b" },
            { label: "Active",    value: activeOrders,              color: "#f97316" },
            { label: "Delivered", value: deliveredOrders,           color: "#15803d" },
            { label: "Spent",     value: `₹${(totalSpent/1000).toFixed(1)}k`, color: "#7c3aed" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "12px 10px", textAlign: "center", border: "1.5px solid #e2e8f0" }}>
              <p style={{ fontSize: 18, fontWeight: 900, color: s.color, margin: "0 0 3px" }}>{loading ? "—" : s.value}</p>
              <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Edit name */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", padding: "20px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>👤 Edit Profile</h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(""); setSaved(false); }}
              placeholder="Your name"
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
              Phone Number
            </label>
            <input
              type="text"
              value={customer?.phone || ""}
              disabled
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: 14, background: "#f8fafc", color: "#94a3b8", boxSizing: "border-box" as const }}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>Phone cannot be changed</p>
          </div>

          {error && <p style={{ fontSize: 13, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", margin: "0 0 14px" }}>❌ {error}</p>}
          {saved && <p style={{ fontSize: 13, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", margin: "0 0 14px" }}>✅ Profile updated successfully!</p>}

          <button onClick={handleSave} disabled={saving || name === customer?.name}
            style={{ width: "100%", padding: "13px", border: "none", borderRadius: 12, background: (saving || name === customer?.name) ? "#94a3b8" : "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: (saving || name === customer?.name) ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Quick links */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {[
            { to: "/dashboard", icon: "🏠", label: "Dashboard" },
            { to: "/orders",    icon: "📋", label: "Order History" },
            { to: "/book",      icon: "🔧", label: "Book a Repair" },
            { to: "/track",     icon: "📍", label: "Track an Order" },
          ].map((item, i, arr) => (
            <Link key={item.to} to={item.to} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", textDecoration: "none", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
              transition: "background .15s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#fff"}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{item.label}</span>
              </div>
              <span style={{ color: "#94a3b8", fontSize: 16 }}>›</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button onClick={() => { logout(); navigate("/"); }}
          style={{ width: "100%", padding: "13px", border: "1.5px solid #fecaca", background: "#fef2f2", borderRadius: 14, color: "#b91c1c", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          🚪 Sign Out
        </button>
      </div>

      <Footer />
    </div>
  );
}
