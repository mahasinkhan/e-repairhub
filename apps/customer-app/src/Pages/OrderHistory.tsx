import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuth";
import { customerGetOrders } from "../services/api";
import Footer from "../Components/Footer";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  placed:     { bg: "#fff7ed", text: "#c2410c", label: "Placed",     icon: "📋" },
  confirmed:  { bg: "#eff6ff", text: "#1d4ed8", label: "Confirmed",  icon: "✅" },
  assigned:   { bg: "#fefce8", text: "#854d0e", label: "Assigned",   icon: "🏪" },
  picked:     { bg: "#f0f9ff", text: "#0369a1", label: "Picked Up",  icon: "📦" },
  repairing:  { bg: "#fef9c3", text: "#713f12", label: "Repairing",  icon: "🔧" },
  completed:  { bg: "#f0fdf4", text: "#15803d", label: "Completed",  icon: "🎉" },
  delivered:  { bg: "#dcfce7", text: "#166534", label: "Delivered",  icon: "🏠" },
  cancelled:  { bg: "#fef2f2", text: "#b91c1c", label: "Cancelled",  icon: "❌" },
};

const FILTERS = ["all", "placed", "repairing", "completed", "delivered", "cancelled"];

export default function OrderHistory() {
  const { isLoggedIn, loading: authLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const [orders,    setOrders]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [expanded,  setExpanded]  = useState<string | null>(null);

  useEffect(() => {
  if (authLoading) return;
  if (!isLoggedIn) { navigate("/login"); return; }
    customerGetOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchSearch = !search.trim() ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.deviceDetails?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      o.deviceDetails?.model?.toLowerCase().includes(search.toLowerCase()) ||
      o.serviceType?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Top nav */}
      <div style={{ background: "#0f172a", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 15 }}>E</div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>RepairHub</span>
        </Link>
        <Link to="/dashboard" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ flex: 1, maxWidth: 700, width: "100%", margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0 0 4px" }}>📋 Order History</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number, device, service..."
            style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px 12px 42px", fontSize: 14, outline: "none", boxSizing: "border-box" as const, background: "#fff" }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {FILTERS.map(f => {
            const count = f === "all" ? orders.length : orders.filter(o => o.status === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: "7px 14px", borderRadius: 999, border: "1.5px solid", cursor: "pointer",
                  fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" as const, transition: "all .15s",
                  background: filter === f ? "#f97316" : "#fff",
                  color:      filter === f ? "#fff"    : "#64748b",
                  borderColor: filter === f ? "#f97316" : "#e2e8f0",
                }}>
                {f.charAt(0).toUpperCase() + f.slice(1)} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ margin: 0 }}>Loading your orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#475569", margin: "0 0 6px" }}>No orders found</p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px" }}>
              {search ? "Try a different search term" : "Book your first repair to get started"}
            </p>
            {!search && (
              <Link to="/book" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", borderRadius: 12, padding: "10px 20px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                Book a Repair →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(order => {
              const s         = STATUS_COLORS[order.status] || STATUS_COLORS.placed;
              const isExpanded = expanded === order._id;
              return (
                <div key={order._id} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

                  {/* Card header — always visible */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : order._id)}
                    style={{ padding: "16px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 46, height: 46, background: s.bg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {s.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: "0 0 2px", fontFamily: "monospace" }}>{order.orderNumber}</p>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                          {order.deviceDetails?.brand} {order.deviceDetails?.model} · {order.serviceType}
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: s.bg, color: s.text, padding: "4px 10px", borderRadius: 999, display: "block", marginBottom: 6 }}>
                        {s.label}
                      </span>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: "0 0 2px" }}>
                        ₹{Number(order.price).toLocaleString("en-IN")}
                      </p>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{isExpanded ? "▲ Less" : "▼ Details"}</p>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 18px", background: "#fafafa" }}>

                      {/* Timeline */}
                      {order.timeline?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", margin: "0 0 10px", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Timeline</p>
                          {[...order.timeline].reverse().slice(0, 4).map((entry: any, i: number) => (
                            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: i === 0 ? "#f97316" : "#cbd5e1", marginTop: 5, flexShrink: 0 }} />
                              <div>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", margin: 0, textTransform: "capitalize" as const }}>
                                  {entry.status.replace(/_/g, " ")}
                                </p>
                                <p style={{ fontSize: 11, color: "#94a3b8", margin: "1px 0 0" }}>
                                  {new Date(entry.time).toLocaleString("en-IN")}
                                </p>
                                {entry.note && <p style={{ fontSize: 11, color: "#64748b", margin: "1px 0 0" }}>{entry.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Repair photos */}
                      {order.images?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>📸 Repair Photos</p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {order.images.map((url: string, i: number) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer">
                                <img src={url} alt="" style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", border: "2px solid #e2e8f0" }} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 10 }}>
                        <Link to={`/track?orderNumber=${order.orderNumber}`}
                          style={{ flex: 1, background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", borderRadius: 12, padding: "10px", textAlign: "center", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                          📍 Track Live
                        </Link>
                        {order.status === "delivered" && (
                          <Link to="/book"
                            style={{ flex: 1, border: "1.5px solid #e2e8f0", color: "#475569", borderRadius: 12, padding: "10px", textAlign: "center", textDecoration: "none", fontWeight: 600, fontSize: 13, background: "#fff" }}>
                            🔄 Book Again
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
