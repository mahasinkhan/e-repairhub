import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { trackOrder } from "../services/api";
import "./Track.css";

const STATUS_STEPS = [
  { key: "placed",     label: "Order Placed",       icon: "📋", desc: "Your repair request received" },
  { key: "confirmed",  label: "Confirmed",           icon: "✅", desc: "Order confirmed by team" },
  { key: "assigned",   label: "Franchise Assigned",  icon: "🏪", desc: "Assigned to repair center" },
  { key: "picked",     label: "Device Picked Up",    icon: "📦", desc: "Device collected for repair" },
  { key: "repairing",  label: "Under Repair",        icon: "🔧", desc: "Device being repaired" },
  { key: "completed",  label: "Repair Complete",     icon: "🎉", desc: "Repair done, ready for delivery" },
  { key: "delivered",  label: "Delivered",           icon: "🏠", desc: "Device delivered back to you" },
];

function getStepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

function formatDate(d: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, activeIdx, onClose }: { images: string[]; activeIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(activeIdx);
  if (images.length === 0) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <button onClick={onClose}
        style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: 20, cursor: "pointer" }}>
        ✕
      </button>

      <button onClick={e => { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)); }}
        disabled={idx === 0}
        style={{ position: "absolute", left: 16, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 22, cursor: idx === 0 ? "not-allowed" : "pointer", opacity: idx === 0 ? 0.3 : 1 }}>
        ‹
      </button>

      <img
        src={images[idx]}
        alt={`Repair proof ${idx + 1}`}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}
      />

      <button onClick={e => { e.stopPropagation(); setIdx(i => Math.min(images.length - 1, i + 1)); }}
        disabled={idx === images.length - 1}
        style={{ position: "absolute", right: 16, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 22, cursor: idx === images.length - 1 ? "not-allowed" : "pointer", opacity: idx === images.length - 1 ? 0.3 : 1 }}>
        ›
      </button>

      <p style={{ position: "absolute", bottom: 16, color: "#94a3b8", fontSize: 13 }}>
        {idx + 1} / {images.length}
      </p>
    </div>
  );
}

const Track: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("orderNumber") || searchParams.get("order") || ""
  );
  const [phone,         setPhone]         = useState("");
  const [order,         setOrder]         = useState<any>(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [searched,      setSearched]      = useState(false);
  const [lightboxIdx,   setLightboxIdx]   = useState<number | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) { setError("Please enter your order number"); return; }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const data = await trackOrder(orderNumber.trim(), phone.trim());
      setOrder(data);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || "Order not found");
      setSearched(true);
    } finally { setLoading(false); }
  };

  const stepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div style={{ minHeight: "80vh", background: "#f8fafc", padding: "40px 16px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>
            📍 Track Your Repair
          </h1>
          <p style={{ fontSize: 15, color: "#64748b" }}>
            Enter your order number to see real-time repair status
          </p>
        </div>

        {/* Search form */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "28px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleTrack}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const }}>
                  Order Number *
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. ERH-1B40D4A7"
                  style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 15, fontWeight: 600, color: "#1e293b", outline: "none", boxSizing: "border-box" as const, letterSpacing: "0.05em" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" as const }}>
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Registered phone"
                  style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#1e293b", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                <p style={{ color: "#b91c1c", fontSize: 13, margin: 0 }}>❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#94a3b8" : "linear-gradient(135deg, #f97316, #ea580c)",
                border: "none", borderRadius: 12, padding: "14px 0", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(249,115,22,0.3)",
              }}>
              {loading ? "🔍 Searching..." : "🔍 Track Order"}
            </button>
          </form>
        </div>

        {/* Result */}
        {order && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Status tracker */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>{order.orderNumber}</h2>
                  <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div style={{
                  padding: "6px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13,
                  background: order.status === "delivered" ? "#dcfce7" : order.status === "cancelled" ? "#fee2e2" : "#fff7ed",
                  color:      order.status === "delivered" ? "#15803d" : order.status === "cancelled" ? "#b91c1c" : "#c2410c",
                }}>
                  {STATUS_STEPS.find(s => s.key === order.status)?.icon} {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </div>
              </div>

              {order.status !== "cancelled" ? (
                <>
                  {/* Progress bar */}
                  <div style={{ position: "relative", paddingBottom: 8 }}>
                    <div style={{ position: "absolute", top: 17, left: "5%", right: "5%", height: 3, background: "#e2e8f0", zIndex: 0, borderRadius: 999 }} />
                    <div style={{
                      position: "absolute", top: 17, left: "5%", height: 3,
                      width: `${(stepIdx / (STATUS_STEPS.length - 1)) * 90}%`,
                      background: "linear-gradient(90deg, #f97316, #22c55e)",
                      zIndex: 1, borderRadius: 999, transition: "width 1s ease",
                    }} />
                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
                      {STATUS_STEPS.map((step, i) => {
                        const done   = i <= stepIdx;
                        const active = i === stepIdx;
                        return (
                          <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%",
                              background: done ? (active ? "#f97316" : "#22c55e") : "#f1f5f9",
                              border: `3px solid ${done ? (active ? "#f97316" : "#22c55e") : "#e2e8f0"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: active ? 18 : 16, transition: "all .3s",
                              boxShadow: active ? "0 0 0 4px rgba(249,115,22,0.2)" : "none",
                            }}>
                              {done ? step.icon : "○"}
                            </div>
                            <p style={{ fontSize: 9, marginTop: 6, textAlign: "center", fontWeight: active ? 700 : 400, color: active ? "#f97316" : done ? "#15803d" : "#94a3b8", lineHeight: 1.3, maxWidth: 65 }}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current step description */}
                  <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "12px 16px", marginTop: 20, textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#c2410c", margin: 0 }}>
                      {STATUS_STEPS[stepIdx]?.icon} {STATUS_STEPS[stepIdx]?.desc}
                    </p>
                  </div>
                </>
              ) : (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px", textAlign: "center" }}>
                  <p style={{ color: "#b91c1c", fontWeight: 700, margin: 0 }}>❌ Order Cancelled</p>
                  {order.cancelReason && <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{order.cancelReason}</p>}
                </div>
              )}
            </div>

            {/* Order details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: "0 0 14px", textTransform: "uppercase" as const }}>Your Device</h3>
                {[
                  ["Brand",   order.deviceDetails?.brand],
                  ["Model",   order.deviceDetails?.model],
                  ["Issue",   order.deviceDetails?.issue],
                  ["Service", order.serviceType],
                  ["Price",   `₹${Number(order.price).toLocaleString("en-IN")}`],
                  ["Payment", order.paymentStatus],
                ].map(([k, v]) => (
                  <div key={k as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 8 }}>
                    <span style={{ color: "#94a3b8" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: "#1e293b", textAlign: "right", maxWidth: "60%" }}>{v || "—"}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: "0 0 14px", textTransform: "uppercase" as const }}>Repair Center</h3>
                {order.assignedFranchise ? (
                  <>
                    {[
                      ["Franchise", (order.assignedFranchise as any).name],
                      ["Location",  (order.assignedFranchise as any).location],
                      ["Contact",   (order.assignedFranchise as any).contact],
                    ].map(([k, v]) => (
                      <div key={k as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 8 }}>
                        <span style={{ color: "#94a3b8" }}>{k}</span>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>{v || "—"}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>Agent</span>
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>
                        {(order.deliveryAgent as any)?.name || "Not assigned"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8" }}>
                    <p style={{ fontSize: 13 }}>🏪 Franchise being assigned...</p>
                    <p style={{ fontSize: 11, marginTop: 4 }}>Our team will contact you shortly</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Repair Proof Photos ────────────────────────────────────────── */}
            {order.images && order.images.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: 0, textTransform: "uppercase" as const }}>
                    📸 Repair Proof Photos
                  </h3>
                  <span style={{ fontSize: 11, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 999, padding: "1px 8px", fontWeight: 600 }}>
                    {order.images.length} photo{order.images.length > 1 ? "s" : ""}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 14px" }}>
                  Photos taken by our technician after completing your repair
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
                  {order.images.map((url: string, i: number) => (
                    <div
                      key={i}
                      onClick={() => setLightboxIdx(i)}
                      style={{ aspectRatio: "1", borderRadius: 12, overflow: "hidden", cursor: "pointer", border: "2px solid #e2e8f0", transition: "all .15s", position: "relative" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = "2px solid #f97316"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = "2px solid #e2e8f0"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}>
                      <img src={url} alt={`Repair proof ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {/* Zoom hint overlay */}
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.3)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)"; }}>
                        <span style={{ color: "#fff", fontSize: 18, opacity: 0 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.opacity = "1"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.opacity = "0"; }}>
                          🔍
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "10px 0 0", textAlign: "center" }}>
                  Click any photo to view full size
                </p>
              </div>
            )}

            {/* Timeline */}
            {order.timeline?.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: "0 0 16px", textTransform: "uppercase" as const }}>Order Timeline</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[...order.timeline].reverse().map((entry: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: i === 0 ? "#f97316" :
                          entry.status === "cancelled" ? "#ef4444" :
                          entry.status === "completed" ? "#22c55e" : "#94a3b8",
                        marginTop: 4, flexShrink: 0,
                      }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: entry.status === "cancelled" ? "#b91c1c" : "#1e293b", margin: 0, textTransform: "capitalize" as const }}>
                          {entry.status === "cancelled" && entry.note?.startsWith("Cannot fix:")
                            ? "❌ Repair Rejected"
                            : entry.status.replace(/_/g, " ")
                          }
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          {formatDate(entry.time)} · by {entry.by}
                        </p>
                        {entry.note && (
                          <p style={{ fontSize: 12, color: entry.status === "cancelled" ? "#dc2626" : "#64748b", marginTop: 2, fontWeight: entry.status === "cancelled" ? 600 : 400 }}>
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setOrder(null); setOrderNumber(""); setPhone(""); setSearched(false); setLightboxIdx(null); }}
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 0", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%" }}>
              Track Another Order
            </button>
          </div>
        )}

        {/* Empty state */}
        {!order && !loading && !searched && (
          <div style={{ background: "#fff", border: "1px dashed #e2e8f0", borderRadius: 20, padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#475569", margin: "0 0 8px" }}>Track Your Repair Order</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>Enter your order number above to see real-time status</p>
            <p style={{ fontSize: 12, color: "#cbd5e1" }}>
              Don't have an order yet?{" "}
              <Link to="/book" style={{ color: "#f97316", fontWeight: 600 }}>Book a repair →</Link>
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && order?.images?.length > 0 && (
        <Lightbox
          images={order.images}
          activeIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
};

export default Track;