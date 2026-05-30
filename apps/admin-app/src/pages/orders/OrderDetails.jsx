import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, MapPin, Smartphone, Wrench, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useOrdersStore } from "../../features/orders/orders.store.js";
import OrderStatusBadge from "../../components/order/OrderStatusBadge.jsx";
import httpClient from "../../services/httpClient.js";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, detailLoading, fetchOrderById, assign, cancel } = useOrdersStore();

  const [franchises, setFranchises] = useState([]);
  const [agents, setAgents] = useState([]);
  const [franchiseId, setFranchiseId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelBox, setShowCancelBox] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrderById(orderId);
    loadDropdowns();
  }, [orderId]);

  const loadDropdowns = async () => {
    try {
      const [fRes, aRes] = await Promise.all([
        httpClient.get("/franchises/active"),
        httpClient.get("/delivery/agents"),
      ]);
      setFranchises(fRes.data?.data ?? []);
      setAgents(aRes.data?.data ?? []);
    } catch {
      // silently fail — dropdowns will just be empty
    }
  };

  const order = selectedOrder;

  const handleAssign = async () => {
    if (!franchiseId && !agentId) return toast.error("Select at least one to assign");
    setActionLoading(true);
    try {
      await assign(orderId, franchiseId || undefined, agentId || undefined);
      toast.success("Order assigned successfully");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return toast.error("Please enter a reason");
    setActionLoading(true);
    try {
      await cancel(orderId, cancelReason);
      toast.success("Order cancelled");
      setShowCancelBox(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (detailLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="text-sm mb-3">Order not found</p>
        <button
          onClick={() => navigate("/orders")}
          className="text-orange-500 text-sm font-medium hover:underline"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Order {order.orderNumber || order._id}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Order details and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Order Info */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-500" />
              Order Info
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">Order ID</p>
                <p className="font-semibold text-slate-800">{order.orderNumber || order._id}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Status</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Service Type</p>
                <p className="text-slate-700">{order.serviceType ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Price</p>
                <p className="font-semibold text-slate-800">₹{order.price ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Payment</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  order.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.paymentStatus ?? "pending"}
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Created</p>
                <p className="text-slate-700">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              Customer Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">{order.customer?.name ?? "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">{order.customer?.phone ?? "—"}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{order.customer?.address ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-orange-500" />
              Device Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">Brand</p>
                <p className="text-slate-700">{order.deviceDetails?.brand ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Model</p>
                <p className="text-slate-700">{order.deviceDetails?.model ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Color</p>
                <p className="text-slate-700">{order.deviceDetails?.color ?? "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 text-xs mb-1">Issue</p>
                <p className="text-slate-700">{order.deviceDetails?.issue ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Status Timeline</h3>
              <div className="space-y-3">
                {order.timeline.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-700 capitalize">{entry.status}</p>
                      <p className="text-xs text-slate-400">
                        {entry.time ? new Date(entry.time).toLocaleString("en-IN") : "—"} · by {entry.by}
                      </p>
                      {entry.note && <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Assignment Panel */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Assignment Panel</h3>

            {/* Current assignment */}
            {(order.assignedFranchise || order.deliveryAgent) && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1.5">
                {order.assignedFranchise && (
                  <p className="text-slate-600">
                    <span className="text-slate-400">Franchise: </span>
                    <span className="font-medium">{order.assignedFranchise.name}</span>
                  </p>
                )}
                {order.deliveryAgent && (
                  <p className="text-slate-600">
                    <span className="text-slate-400">Agent: </span>
                    <span className="font-medium">{order.deliveryAgent.name}</span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Select Franchise
                </label>
                <select
                  value={franchiseId}
                  onChange={(e) => setFranchiseId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition"
                >
                  <option value="">— Select franchise —</option>
                  {franchises.map((f) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Select Delivery Agent
                </label>
                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition"
                >
                  <option value="">— Select agent —</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name || a.username}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssign}
                disabled={actionLoading || order.status === "cancelled"}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition"
              >
                {actionLoading ? "Assigning..." : "Assign / Reassign"}
              </button>
            </div>
          </div>

          {/* Admin Controls */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Admin Controls</h3>
            <div className="space-y-2">
              {order.status !== "cancelled" && order.status !== "delivered" ? (
                !showCancelBox ? (
                  <button
                    onClick={() => setShowCancelBox(true)}
                    className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg py-2.5 text-sm transition"
                  >
                    Cancel Order
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Enter cancellation reason..."
                      rows={3}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2 text-sm transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowCancelBox(false)}
                        className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg py-2 text-sm transition"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">
                  Order is {order.status} — no further actions available
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}