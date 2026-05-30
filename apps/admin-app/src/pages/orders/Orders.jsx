import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Eye, RefreshCw, Package, Plus, X,
  MapPin, Zap, CheckCircle, AlertCircle, Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "../../features/orders/orders.store.js";
import OrderStatusBadge from "../../components/order/OrderStatusBadge.jsx";
import httpClient from "../../services/httpClient.js";

const TABS = [
  { label: "All",       value: "all"       },
  { label: "New",       value: "placed"    },
  { label: "Assigned",  value: "assigned"  },
  { label: "Picked",    value: "picked"    },
  { label: "Repairing", value: "repairing" },
  { label: "Completed", value: "completed" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const EMPTY_ORDER_FORM = {
  customerName: "", customerPhone: "", customerAddress: "",
  deviceBrand: "", deviceModel: "", deviceColor: "", deviceIssue: "",
  serviceType: "", price: "", paymentStatus: "pending",
};

// ── Distance badge ────────────────────────────────────────────────────────────
function DistanceBadge({ distKm }) {
  if (distKm === null || distKm === undefined) {
    return <span style={{ fontSize: 10, padding: "2px 6px", background: "#f1f5f9", color: "#94a3b8", borderRadius: 999 }}>No location</span>;
  }
  const color = distKm <= 5   ? { bg: "#dcfce7", text: "#15803d" }
              : distKm <= 15  ? { bg: "#fef9c3", text: "#a16207" }
              : { bg: "#fee2e2", text: "#b91c1c" };
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", background: color.bg, color: color.text, borderRadius: 999, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
      <MapPin size={9} /> {distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`}
    </span>
  );
}

// ── Assign Modal ──────────────────────────────────────────────────────────────
function AssignModal({ open, order, onClose, onSuccess }) {
  const [franchises,  setFranchises]  = useState([]);
  const [agents,      setAgents]      = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [assigning,   setAssigning]   = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [selectedAgent,     setSelectedAgent]     = useState(null);
  const [tab,         setTab]         = useState("franchise");
  const [geoStatus,   setGeoStatus]   = useState(""); // "", "loading", "done", "error"

  const customerAddress = order?.customer?.address;
  const customerCoords  = order?.customer?.coordinates?.coordinates; // [lng, lat]
  const hasCoords       = customerCoords?.length === 2;

  const loadNearby = useCallback(async () => {
    if (!order) return;
    setLoading(true);
    setGeoStatus("loading");

    try {
      const params = {};
      if (hasCoords) {
        params.lng = customerCoords[0];
        params.lat = customerCoords[1];
      } else if (customerAddress) {
        params.address = customerAddress;
      }
      params.maxKm = 50;

      const [fRes, aRes] = await Promise.all([
        httpClient.get("/franchises/nearby", { params }),
        httpClient.get("/delivery/nearby-agents", { params }),
      ]);

      setFranchises(fRes.data?.data ?? []);
      setAgents(aRes.data?.data ?? []);
      setGeoStatus("done");
    } catch {
      // Fallback: load all
      try {
        const [fRes, aRes] = await Promise.all([
          httpClient.get("/franchises/active"),
          httpClient.get("/delivery/agents"),
        ]);
        setFranchises(fRes.data?.data?.map(f => ({ ...f, distKm: null })) ?? []);
        setAgents(aRes.data?.data?.map(a => ({ ...a, distKm: null })) ?? []);
        setGeoStatus("error");
      } catch {}
    } finally { setLoading(false); }
  }, [order, hasCoords, customerAddress, customerCoords]);

  useEffect(() => {
    if (open) {
      setSelectedFranchise(null);
      setSelectedAgent(null);
      setTab("franchise");
      loadNearby();
    }
  }, [open, loadNearby]);

  if (!open || !order) return null;

  const handleAssign = async () => {
    if (!selectedFranchise && !selectedAgent) {
      toast.error("Select a franchise or agent"); return;
    }
    setAssigning(true);
    try {
      await httpClient.patch(`/orders/${order._id}/assign`, {
        franchiseId: selectedFranchise?._id,
        agentId:     selectedAgent?._id,
      });
      toast.success("Order assigned successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setAssigning(false); }
  };

  const within5km = f => f.distKm !== null && f.distKm <= 5;
  const within5Agents = agents.filter(a => within5km(a));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(15,23,42,0.55)" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", margin: 0 }}>Assign Order</h3>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
              <span style={{ fontWeight: 700, color: "#f97316" }}>{order.orderNumber}</span> · {order.customer?.name}
            </p>
            {customerAddress && (
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={10} /> {customerAddress}
                {hasCoords && <span style={{ color: "#22c55e", fontWeight: 700 }}>· GPS ✓</span>}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Geo status bar */}
        {geoStatus === "loading" && (
          <div style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe", padding: "8px 24px", fontSize: 12, color: "#1d4ed8", display: "flex", alignItems: "center", gap: 6 }}>
            <Navigation size={12} className="animate-spin" /> Finding nearest franchises and agents...
          </div>
        )}
        {geoStatus === "done" && (
          <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", padding: "8px 24px", fontSize: 12, color: "#15803d", display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={12} /> Sorted by distance from customer · {within5Agents.length} agent(s) within 5km
          </div>
        )}
        {geoStatus === "error" && (
          <div style={{ background: "#fff7ed", borderBottom: "1px solid #fed7aa", padding: "8px 24px", fontSize: 12, color: "#c2410c", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={12} /> Could not geocode address — showing all available
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9" }}>
          {[
            { key: "franchise", label: `🏪 Franchise (${franchises.length})` },
            { key: "agent",     label: `🚗 Agent (${agents.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "12px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                borderBottom: tab === t.key ? "2.5px solid #f97316" : "2.5px solid transparent",
                color: tab === t.key ? "#f97316" : "#64748b",
                background: tab === t.key ? "#fff7ed" : "#fff",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
              <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 8, fontSize: 13 }}>Loading nearby {tab === "franchise" ? "franchises" : "agents"}...</p>
            </div>
          ) : tab === "franchise" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {franchises.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                  <p style={{ fontSize: 13 }}>No active franchises found</p>
                  <p style={{ fontSize: 11, marginTop: 4 }}>Add franchises in the Franchise section</p>
                </div>
              ) : (
                franchises.map(f => {
                  const isSelected = selectedFranchise?._id === f._id;
                  const inRange    = f.distKm !== null && f.distKm <= 5;
                  return (
                    <button key={f._id} onClick={() => setSelectedFranchise(isSelected ? null : f)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                        borderRadius: 12, border: isSelected ? "2px solid #f97316" : "1.5px solid #e2e8f0",
                        background: isSelected ? "#fff7ed" : inRange ? "#f0fdf4" : "#fff",
                        cursor: "pointer", textAlign: "left", transition: "all .15s",
                        boxShadow: isSelected ? "0 0 0 3px rgba(249,115,22,0.15)" : "none",
                      }}>

                      {/* Icon */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: inRange ? "#dcfce7" : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, flexShrink: 0,
                      }}>
                        🏪
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", margin: 0 }}>{f.name}</p>
                          {inRange && (
                            <span style={{ fontSize: 9, padding: "1px 6px", background: "#dcfce7", color: "#15803d", borderRadius: 999, fontWeight: 700 }}>
                              ⚡ NEAREST
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          📍 {f.formattedAddress || f.location}
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                          📞 {f.contact} · {f.commissionPercent}% commission
                        </p>
                      </div>

                      {/* Distance */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <DistanceBadge distKm={f.distKm} />
                        {isSelected && <CheckCircle size={16} color="#f97316" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {agents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                  <p style={{ fontSize: 13 }}>No delivery agents found</p>
                  <p style={{ fontSize: 11, marginTop: 4 }}>Add delivery agents in Users section and set their address</p>
                </div>
              ) : (
                agents.map(a => {
                  const isSelected = selectedAgent?._id === a._id;
                  const inRange    = a.distKm !== null && a.distKm <= 5;
                  const busy       = a.activeTaskCount >= 3;
                  return (
                    <button key={a._id} onClick={() => !busy && setSelectedAgent(isSelected ? null : a)}
                      disabled={busy}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                        borderRadius: 12, border: isSelected ? "2px solid #f97316" : "1.5px solid #e2e8f0",
                        background: isSelected ? "#fff7ed" : busy ? "#f8fafc" : inRange ? "#f0fdf4" : "#fff",
                        cursor: busy ? "not-allowed" : "pointer", textAlign: "left", transition: "all .15s",
                        opacity: busy ? 0.6 : 1,
                        boxShadow: isSelected ? "0 0 0 3px rgba(249,115,22,0.15)" : "none",
                      }}>

                      {/* Avatar */}
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: inRange ? "#dbeafe" : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 700, color: "#3b82f6", flexShrink: 0,
                      }}>
                        {a.name?.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", margin: 0 }}>{a.name}</p>
                          {inRange && !busy && (
                            <span style={{ fontSize: 9, padding: "1px 6px", background: "#dbeafe", color: "#1d4ed8", borderRadius: 999, fontWeight: 700 }}>
                              ⚡ NEARBY
                            </span>
                          )}
                          {busy && (
                            <span style={{ fontSize: 9, padding: "1px 6px", background: "#fee2e2", color: "#b91c1c", borderRadius: 999, fontWeight: 700 }}>
                              BUSY
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>📞 {a.phone || a.email}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                          {a.city || a.address || "Location not set"} · {a.activeTaskCount} active tasks
                        </p>
                      </div>

                      {/* Distance + available */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <DistanceBadge distKm={a.distKm} />
                        <span style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 999, fontWeight: 700,
                          background: a.available ? "#dcfce7" : "#fee2e2",
                          color:      a.available ? "#15803d" : "#b91c1c",
                        }}>
                          {a.available ? "Available" : "Busy"}
                        </span>
                        {isSelected && <CheckCircle size={16} color="#f97316" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 12 }}>
          {/* Selection summary */}
          <div style={{ flex: 1, display: "flex", gap: 8 }}>
            {selectedFranchise && (
              <div style={{ fontSize: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "6px 10px", color: "#c2410c", display: "flex", alignItems: "center", gap: 4 }}>
                🏪 {selectedFranchise.name}
                {selectedFranchise.distKm !== null && <span>· {selectedFranchise.distKm.toFixed(1)}km</span>}
              </div>
            )}
            {selectedAgent && (
              <div style={{ fontSize: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 10px", color: "#1d4ed8", display: "flex", alignItems: "center", gap: 4 }}>
                🚗 {selectedAgent.name}
                {selectedAgent.distKm !== null && <span>· {selectedAgent.distKm.toFixed(1)}km</span>}
              </div>
            )}
          </div>
          <button onClick={onClose}
            style={{ padding: "10px 20px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#fff", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={handleAssign} disabled={assigning || (!selectedFranchise && !selectedAgent)}
            style={{
              padding: "10px 24px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
              background: (!selectedFranchise && !selectedAgent) ? "#e2e8f0" : "linear-gradient(135deg,#f97316,#ea580c)",
              color: (!selectedFranchise && !selectedAgent) ? "#94a3b8" : "#fff",
              boxShadow: (!selectedFranchise && !selectedAgent) ? "none" : "0 4px 12px rgba(249,115,22,0.3)",
            }}>
            {assigning ? "Assigning..." : "Assign →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Orders page ──────────────────────────────────────────────────────────
export default function Orders() {
  const navigate = useNavigate();
  const { orders, loading, filters, setFilters, fetchOrders } = useOrdersStore();
  const [search,          setSearch]          = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignModal,     setAssignModal]     = useState({ open: false, order: null });
  const [orderForm,       setOrderForm]       = useState(EMPTY_ORDER_FORM);
  const [creating,        setCreating]        = useState(false);

  useEffect(() => { fetchOrders(); }, [filters.status]);

  const handleTabChange = v => setFilters({ status: v });

  const handleSearch = e => {
    e.preventDefault();
    setFilters({ search });
    fetchOrders();
  };

  const handleView = order => {
    if (order.isMock) { toast.info("Sample data — create a real order to view details."); return; }
    navigate(`/orders/${order._id}`);
  };

  const handleOrderFormChange = e => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrder = async e => {
    e.preventDefault();
    if (!orderForm.customerName.trim())    return toast.error("Customer name is required");
    if (!orderForm.customerPhone.trim())   return toast.error("Customer phone is required");
    if (!orderForm.customerAddress.trim()) return toast.error("Customer address is required");
    if (!orderForm.deviceBrand.trim())     return toast.error("Device brand is required");
    if (!orderForm.deviceModel.trim())     return toast.error("Device model is required");
    if (!orderForm.deviceIssue.trim())     return toast.error("Device issue is required");
    if (!orderForm.serviceType.trim())     return toast.error("Service type is required");
    if (!orderForm.price)                  return toast.error("Price is required");

    setCreating(true);
    try {
      await httpClient.post("/orders", {
        customer:      { name: orderForm.customerName, phone: orderForm.customerPhone, address: orderForm.customerAddress },
        deviceDetails: { brand: orderForm.deviceBrand, model: orderForm.deviceModel, color: orderForm.deviceColor, issue: orderForm.deviceIssue },
        serviceType:   orderForm.serviceType,
        price:         Number(orderForm.price),
        paymentStatus: orderForm.paymentStatus,
      });
      toast.success("Order created successfully");
      setShowCreateModal(false);
      setOrderForm(EMPTY_ORDER_FORM);
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setCreating(false); }
  };

  const displayOrders = orders.length > 0 ? orders : [];
  const filteredOrders = filters.status === "all"
    ? displayOrders
    : displayOrders.filter(o => o.status === filters.status);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Orders</h2>
          <p className="text-slate-500 text-sm mt-1">Manage all repair orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchOrders()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition shadow-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition shadow-sm">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="border-b border-slate-200 overflow-x-auto">
          <div className="flex px-4 gap-0 min-w-max">
            {TABS.map(tab => (
              <button key={tab.value} onClick={() => handleTabChange(tab.value)}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  filters.status === tab.value
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100">
          <form onSubmit={handleSearch} className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search order ID, customer..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Package className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No orders found</p>
              <button onClick={() => setShowCreateModal(true)}
                className="mt-3 text-orange-500 text-sm font-medium hover:underline">
                Create first order
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Order", "Customer", "Device", "Service", "Price", "Payment", "Franchise", "Agent", "Status", "Action"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      <div>{order.orderNumber || order._id}</div>
                      {order.customer?.coordinates?.coordinates && (
                        <div style={{ fontSize: 10, color: "#22c55e", display: "flex", alignItems: "center", gap: 3 }}>
                          <MapPin size={8} /> GPS
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-slate-700">{order.customer?.name || "—"}</p>
                      <p className="text-xs text-slate-400">{order.customer?.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {order.deviceDetails?.brand} {order.deviceDetails?.model}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{order.serviceType}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">₹{order.price}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.paymentStatus ?? "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {order.assignedFranchise?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {order.deliveryAgent?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(order)}
                          className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium text-xs transition">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        {["placed", "confirmed"].includes(order.status) && (
                          <button onClick={() => setAssignModal({ open: true, order })}
                            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium text-xs transition">
                            <MapPin className="w-3.5 h-3.5" /> Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Assign Modal */}
      <AssignModal
        open={assignModal.open}
        order={assignModal.order}
        onClose={() => setAssignModal({ open: false, order: null })}
        onSuccess={() => { fetchOrders(); setAssignModal({ open: false, order: null }); }}
      />

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-slate-800">Create New Order</h3>
              <button onClick={() => { setShowCreateModal(false); setOrderForm(EMPTY_ORDER_FORM); }}
                className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Customer Info</p>
                <div className="space-y-3">
                  <input name="customerName" value={orderForm.customerName} onChange={handleOrderFormChange}
                    placeholder="Customer full name *"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                  <input name="customerPhone" value={orderForm.customerPhone} onChange={handleOrderFormChange}
                    placeholder="Phone number *"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                  <input name="customerAddress" value={orderForm.customerAddress} onChange={handleOrderFormChange}
                    placeholder="Full address (for nearby matching) *"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Device Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <input name="deviceBrand" value={orderForm.deviceBrand} onChange={handleOrderFormChange}
                    placeholder="Brand * (e.g. Apple)"
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                  <input name="deviceModel" value={orderForm.deviceModel} onChange={handleOrderFormChange}
                    placeholder="Model * (e.g. iPhone 13)"
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                  <input name="deviceColor" value={orderForm.deviceColor} onChange={handleOrderFormChange}
                    placeholder="Color (optional)"
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                  <input name="deviceIssue" value={orderForm.deviceIssue} onChange={handleOrderFormChange}
                    placeholder="Issue * (e.g. Cracked screen)"
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Service & Payment</p>
                <div className="grid grid-cols-2 gap-3">
                  <input name="serviceType" value={orderForm.serviceType} onChange={handleOrderFormChange}
                    placeholder="Service type *"
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                  <input name="price" type="number" min="0" value={orderForm.price} onChange={handleOrderFormChange}
                    placeholder="Price (₹) *"
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
                  <select name="paymentStatus" value={orderForm.paymentStatus} onChange={handleOrderFormChange}
                    className="col-span-2 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition">
                    <option value="pending">Payment: Pending</option>
                    <option value="paid">Payment: Paid</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreateModal(false); setOrderForm(EMPTY_ORDER_FORM); }}
                  className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg py-2.5 text-sm transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition">
                  {creating ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}