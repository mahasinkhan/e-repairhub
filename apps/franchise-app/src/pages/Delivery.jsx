import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck, Package, RefreshCw, Phone, MapPin,
  Clock, Smartphone, ChevronRight, Search,
  PackageCheck, Store,
} from "lucide-react";
import { getMyDeliveryOrders } from "../services/franchise.api.js";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusPill({ label, color }) {
  const styles = {
    orange: { background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" },
    blue:   { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
    green:  { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
    yellow: { background: "#fefce8", color: "#854d0e", border: "1px solid #fef08a" },
  };
  return (
    <span style={{
      ...styles[color],
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

function OrderCard({ order, tab, navigate }) {
  const device = order.deviceDetails;
  const customer = order.customer;

  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
      padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      transition: "box-shadow .15s", cursor: "pointer",
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
    onClick={() => navigate(`/repair?orderId=${order._id}`)}
    >
      {/* Order header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{order.orderNumber}</span>
            {tab === "awaiting" && <StatusPill label="Awaiting Pickup" color="orange" />}
            {tab === "atShop"   && <StatusPill label={order.status === "repairing" ? "Repairing" : "At Shop"} color={order.status === "repairing" ? "yellow" : "blue"} />}
            {tab === "ready"    && <StatusPill label="Ready for Delivery" color="green" />}
          </div>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{order.serviceType}</p>
        </div>
        <p style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
          ₹{Number(order.price).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Device */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: "#475569", fontSize: 13 }}>
        <Smartphone size={14} color="#94a3b8" />
        <span>{device?.brand} {device?.model}</span>
        {device?.color && <span style={{ color: "#94a3b8" }}>· {device.color}</span>}
      </div>

      {/* Customer */}
      <div style={{
        background: "#f8fafc", borderRadius: 10, padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
        }}>
          {customer?.name?.charAt(0)?.toUpperCase() ?? "C"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", marginBottom: 2 }}>{customer?.name}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
              <Phone size={11} /> {customer?.phone}
            </span>
            {customer?.address && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94a3b8" }}>
                <MapPin size={11} /> {customer.address}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Agent + Date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
          <Truck size={13} color="#94a3b8" />
          {order.deliveryAgent
            ? <span>Agent: <strong style={{ color: "#1e293b" }}>{order.deliveryAgent.name || order.deliveryAgent.username}</strong></span>
            : <span style={{ color: "#94a3b8" }}>No agent assigned</span>
          }
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94a3b8" }}>
          <Clock size={11} /> {fmt(order.createdAt)}
        </span>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/repair?orderId=${order._id}`); }}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
            fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 6,
            ...(tab === "awaiting"
              ? { background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }
              : tab === "ready"
              ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }
              : { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }),
          }}>
          {tab === "awaiting" && <><PackageCheck size={14} /> Mark as Received</>}
          {tab === "atShop"   && <><Store size={14} /> {order.status === "repairing" ? "Complete Repair" : "Start Repair"}</>}
          {tab === "ready"    && <><Truck size={14} /> Ready for Delivery</>}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { key: "awaiting", label: "Awaiting Pickup",    icon: Package,      color: "#c2410c", bg: "#fff7ed" },
  { key: "atShop",   label: "At Shop",            icon: Store,        color: "#1d4ed8", bg: "#eff6ff" },
  { key: "ready",    label: "Ready for Delivery", icon: PackageCheck, color: "#15803d", bg: "#f0fdf4" },
];

export default function Delivery() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("awaiting");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyDeliveryOrders();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const currentOrders = data
    ? activeTab === "awaiting" ? data.awaitingPickup
    : activeTab === "atShop"  ? data.atShop
    : data.readyForDelivery
    : [];

  const filtered = search.trim()
    ? (currentOrders ?? []).filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.phone?.includes(search)
      )
    : (currentOrders ?? []);

  const counts = data?.counts ?? { awaitingPickup: 0, atShop: 0, readyForDelivery: 0, total: 0 };
  const countMap = { awaiting: counts.awaitingPickup, atShop: counts.atShop, ready: counts.readyForDelivery };

  return (
    <div className="content-shell" style={{ padding: "24px 28px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Delivery Tracking</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Track pickups, repairs, and customer deliveries in real time</p>
        </div>
        <button onClick={load} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
          padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#475569",
          cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}>
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Awaiting Pickup",     value: counts.awaitingPickup,  color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
          { label: "At Shop",             value: counts.atShop,          color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
          { label: "Ready for Delivery",  value: counts.readyForDelivery,color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "Total Active",        value: counts.total,           color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14,
            padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: 0 }}>{loading ? "—" : s.value}</p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          const count = countMap[tab.key] ?? 0;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 18px", borderRadius: 10, border: "none",
              fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .15s",
              background: active ? tab.color : "#f1f5f9",
              color: active ? "#fff" : "#64748b",
              boxShadow: active ? `0 2px 8px ${tab.color}40` : "none",
            }}>
              <Icon size={14} />
              {tab.label}
              <span style={{
                background: active ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                color: active ? "#fff" : "#475569",
                borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 700,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 400, marginBottom: 20 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search order, customer, phone..."
          style={{
            width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
            border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155",
            background: "#f8fafc", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", color: "#94a3b8", gap: 10 }}>
          <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 14 }}>Loading delivery orders...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <Truck size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#475569" }}>
            {search ? "No matching orders" : `No ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()} orders`}
          </p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            {activeTab === "awaiting" ? "Orders assigned to your franchise will appear here" :
             activeTab === "atShop"   ? "Orders received at your shop will appear here" :
             "Completed repairs ready to return to customers will appear here"}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filtered.map(order => (
            <OrderCard key={order._id} order={order} tab={activeTab} navigate={navigate} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}