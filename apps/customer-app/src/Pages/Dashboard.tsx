import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuth";
import { customerGetOrders } from "../services/api";
import Footer from "../Components/Footer";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  placed:    { bg: "#fff7ed", text: "#c2410c", label: "Placed",    icon: "📋" },
  confirmed: { bg: "#eff6ff", text: "#1d4ed8", label: "Confirmed", icon: "✅" },
  assigned:  { bg: "#fefce8", text: "#854d0e", label: "Assigned",  icon: "🏪" },
  picked:    { bg: "#f0f9ff", text: "#0369a1", label: "Picked Up", icon: "📦" },
  repairing: { bg: "#fef9c3", text: "#713f12", label: "Repairing", icon: "🔧" },
  completed: { bg: "#f0fdf4", text: "#15803d", label: "Completed", icon: "🎉" },
  delivered: { bg: "#dcfce7", text: "#166534", label: "Delivered", icon: "🏠" },
  cancelled: { bg: "#fef2f2", text: "#b91c1c", label: "Cancelled", icon: "❌" },
};

const ACTIVE_STATUSES = ["placed", "confirmed", "assigned", "picked", "repairing"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { customer, logout, isLoggedIn, loading: authLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const [orders,       setOrders]       = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    // ── Wait for auth context to finish loading from localStorage ──
    if (authLoading) return;
    // ── Only then check if logged in ──
    if (!isLoggedIn) { navigate("/login"); return; }

    customerGetOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setOrdersLoading(false));
  }, [isLoggedIn, authLoading]);

  // Show spinner while auth context loads
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14, margin: 0 }}>Loading...</p>
        </div>
      </div>
    );
  }

  const activeOrders   = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const recentOrders   = orders.slice(0, 5);
  const completedCount = orders.filter(o => o.status === "delivered").length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Top nav */}
      <div style={{ background: "#0f172a", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 15 }}>E</div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>RepairHub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/orders"  style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>My Orders</Link>
          <Link to="/profile" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>Profile</Link>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 700, width: "100%", margin: "0 auto", padding: "24px 16px" }}>

        {/* Greeting card */}
        <div style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 20, padding: "24px 24px 20px", marginBottom: 20, color: "#fff" }}>
          <p style={{ fontSize: 13, opacity: 0.8, margin: "0 0 4px" }}>{greeting()},</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 16px" }}>{customer?.name || "Welcome"} 👋</h1>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Total Orders", value: orders.length },
              { label: "Active",       value: activeOrders.length },
              { label: "Delivered",    value: completedCount },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 16px", textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{ordersLoading ? "—" : s.value}</p>
                <p style={{ fontSize: 11, opacity: 0.8, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active repair widget */}
        {!ordersLoading && activeOrders.length > 0 && (
          <div style={{ background: "#fff", border: "2px solid #f97316", borderRadius: 18, padding: "18px 20px", marginBottom: 20, boxShadow: "0 4px 14px rgba(249,115,22,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: "#f97316", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                Active Repair{activeOrders.length > 1 ? "s" : ""}
              </p>
            </div>
            {activeOrders.slice(0, 2).map(order => {
              const s = STATUS_COLORS[order.status] || STATUS_COLORS.placed;
              return (
                <Link key={order._id} to={`/track?orderNumber=${order.orderNumber}`} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 3px", fontFamily: "monospace" }}>{order.orderNumber}</p>
                      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                        {order.deviceDetails?.brand} {order.deviceDetails?.model} · {order.serviceType}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: s.bg, color: s.text, padding: "4px 10px", borderRadius: 999, display: "inline-block" }}>
                        {s.icon} {s.label}
                      </span>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>Tap to track →</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { icon: "🔧", label: "Book a Repair",  desc: "Start a new repair",   to: "/book",    bg: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none" },
            { icon: "📍", label: "Track Order",    desc: "Check repair status",  to: "/track",   bg: "#fff", color: "#1e293b", border: "1.5px solid #e2e8f0" },
            { icon: "📋", label: "Order History",  desc: "View all orders",      to: "/orders",  bg: "#fff", color: "#1e293b", border: "1.5px solid #e2e8f0" },
            { icon: "👤", label: "My Profile",     desc: "Update your details",  to: "/profile", bg: "#fff", color: "#1e293b", border: "1.5px solid #e2e8f0" },
          ].map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration: "none" }}>
              <div style={{ background: a.bg, color: a.color, borderRadius: 16, padding: "18px 16px", border: a.border, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "100%", boxSizing: "border-box" as const }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{a.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 800, margin: "0 0 3px", color: "inherit" }}>{a.label}</p>
                <p style={{ fontSize: 12, margin: 0, opacity: 0.6, color: "inherit" }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>Recent Orders</h3>
            <Link to="/orders" style={{ fontSize: 12, color: "#f97316", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>

          {ordersLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              <p style={{ margin: 0, fontSize: 13 }}>Loading your orders...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#475569", margin: "0 0 6px" }}>No orders yet</p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>Book your first repair and we'll handle the rest</p>
              <Link to="/book" style={{ display: "inline-block", background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", borderRadius: 12, padding: "10px 20px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                Book a Repair →
              </Link>
            </div>
          ) : (
            <div>
              {recentOrders.map((order, i) => {
                const s = STATUS_COLORS[order.status] || STATUS_COLORS.placed;
                return (
                  <Link key={order._id} to={`/track?orderNumber=${order.orderNumber}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < recentOrders.length - 1 ? "1px solid #f1f5f9" : "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#fff"}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 42, height: 42, background: s.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                          {s.icon}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 2px", fontFamily: "monospace" }}>{order.orderNumber}</p>
                          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{order.deviceDetails?.brand} {order.deviceDetails?.model}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8", margin: "1px 0 0" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: s.bg, color: s.text, padding: "3px 10px", borderRadius: 999, display: "block", marginBottom: 4 }}>
                          {s.label}
                        </span>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                          ₹{Number(order.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sign out */}
        <button onClick={() => { logout(); navigate("/"); }}
          style={{ width: "100%", marginTop: 16, padding: "12px", border: "1.5px solid #fecaca", background: "#fef2f2", borderRadius: 14, color: "#b91c1c", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          Sign Out
        </button>
      </div>

      <Footer />
    </div>
  );
}
