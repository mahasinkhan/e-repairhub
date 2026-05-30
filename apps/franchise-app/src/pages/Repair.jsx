import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Phone, MapPin, Smartphone,
  Wrench, RefreshCw, CheckCircle, PlayCircle,
  PackageCheck, Clock, XCircle, AlertTriangle, PlusCircle,
} from "lucide-react";
import {
  getMyOrderById, markReceived, startRepair, completeRepair,
  rejectRepair, requestExtraService,
} from "../services/franchise.api.js";

const STATUS_STEPS = [
  { key: "assigned",  label: "Assigned"  },
  { key: "confirmed", label: "Accepted"  },
  { key: "picked",    label: "Received"  },
  { key: "repairing", label: "Repairing" },
  { key: "completed", label: "Completed" },
  { key: "delivered", label: "Delivered" },
];

function StatusBadge({ status }) {
  const colors = {
    assigned:  "bg-orange-100 text-orange-700",
    confirmed: "bg-blue-100 text-blue-700",
    picked:    "bg-cyan-100 text-cyan-700",
    repairing: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    delivered: "bg-teal-100 text-teal-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function StepBar({ status }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-0 w-full">
      {STATUS_STEPS.map((step, i) => {
        const done   = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ${
                active ? "border-blue-500 bg-blue-500 text-white" :
                done   ? "border-green-500 bg-green-500 text-white" :
                "border-slate-300 bg-white text-slate-400"
              }`}>
                {done && !active ? "✓" : i + 1}
              </div>
              <p className={`text-xs mt-1 whitespace-nowrap ${active ? "text-blue-600 font-semibold" : done ? "text-green-600" : "text-slate-400"}`}>
                {step.label}
              </p>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? "bg-green-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Reject Repair Modal ───────────────────────────────────────────────────────
function RejectRepairModal({ open, order, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  const [error,  setError]  = useState("");

  useEffect(() => { if (open) { setReason(""); setError(""); } }, [open]);
  if (!open) return null;

  const handleSubmit = () => {
    if (!reason.trim())            { setError("Please provide a reason for rejection"); return; }
    if (reason.trim().length < 10) { setError("Please provide a detailed reason (min 10 characters)"); return; }
    onConfirm(reason.trim());
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, boxShadow: "0 24px 48px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <AlertTriangle size={20} color="#fca5a5" />
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 800, margin: 0 }}>Cannot Fix — Reject Repair</h3>
          </div>
          <p style={{ color: "#fca5a5", fontSize: 12, margin: 0 }}>
            Order: {order?.orderNumber} · {order?.deviceDetails?.brand} {order?.deviceDetails?.model}
          </p>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#b91c1c", margin: 0, fontWeight: 600 }}>⚠️ What happens when you reject:</p>
            <ul style={{ fontSize: 12, color: "#dc2626", margin: "8px 0 0", paddingLeft: 16, lineHeight: 1.6 }}>
              <li>Order will be marked as <strong>Cancelled</strong></li>
              <li>Customer <strong>{order?.customer?.name}</strong> will receive an SMS notification</li>
              <li>Your team should arrange device return to customer</li>
            </ul>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
              Reason for Rejection *
            </label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setError(""); }}
              placeholder="e.g. Device has severe motherboard damage that cannot be repaired..."
              rows={4}
              style={{ width: "100%", border: `1.5px solid ${error ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.5 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {error
                ? <p style={{ fontSize: 12, color: "#b91c1c", margin: 0 }}>❌ {error}</p>
                : <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>This reason will be sent to the customer via SMS</p>
              }
              <p style={{ fontSize: 11, color: reason.length < 10 ? "#94a3b8" : "#22c55e", margin: 0 }}>{reason.length}/10 min</p>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>QUICK REASONS:</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Severe motherboard damage", "Liquid damage — beyond repair", "Spare parts unavailable", "Structural damage to chassis", "IC chip failure — unrepairable"].map(r => (
                <button key={r} onClick={() => setReason(r)}
                  style={{ fontSize: 11, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 20, padding: "4px 10px", cursor: "pointer", color: "#475569", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} disabled={loading}
              style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 1, border: "none", borderRadius: 12, padding: "12px", background: loading ? "#94a3b8" : "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {loading ? "Submitting..." : <><XCircle size={16} /> Reject & Notify Customer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Extra Service Modal ───────────────────────────────────────────────────────
function ExtraServiceModal({ open, order, onClose, onConfirm, loading }) {
  const [name,   setName]   = useState("");
  const [price,  setPrice]  = useState("");
  const [reason, setReason] = useState("");
  const [error,  setError]  = useState("");

  useEffect(() => { if (open) { setName(""); setPrice(""); setReason(""); setError(""); } }, [open]);
  if (!open) return null;

  const QUICK_SERVICES = [
    { name: "Battery Replacement",    price: 500 },
    { name: "Charging Port Repair",   price: 400 },
    { name: "Speaker Replacement",    price: 600 },
    { name: "Camera Repair",          price: 800 },
    { name: "Back Panel Replacement", price: 300 },
    { name: "Motherboard Cleaning",   price: 350 },
  ];

  const handleSubmit = () => {
    if (!name.trim())                 { setError("Service name is required"); return; }
    if (!price || Number(price) <= 0) { setError("Valid price is required"); return; }
    if (!reason.trim())               { setError("Please explain why this service is needed"); return; }
    onConfirm({ name: name.trim(), price: Number(price), reason: reason.trim() });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 48px rgba(0,0,0,0.25)" }}>
        <div style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", padding: "20px 24px", borderRadius: "20px 20px 0 0", position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <PlusCircle size={20} color="#c4b5fd" />
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 800, margin: 0 }}>Request Extra Service</h3>
          </div>
          <p style={{ color: "#c4b5fd", fontSize: 12, margin: 0 }}>
            {order?.orderNumber} · {order?.deviceDetails?.brand} {order?.deviceDetails?.model}
          </p>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "#7c3aed", margin: 0, fontWeight: 600 }}>ℹ️ Customer will be notified via SMS</p>
            <p style={{ fontSize: 12, color: "#6d28d9", margin: "4px 0 0", lineHeight: 1.5 }}>
              They must approve this service before you add it. The order total will update automatically upon approval.
            </p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>QUICK ADD:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {QUICK_SERVICES.map(s => (
                <button key={s.name}
                  onClick={() => { setName(s.name); setPrice(String(s.price)); setError(""); }}
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, cursor: "pointer", background: name === s.name ? "#f5f3ff" : "#f8fafc", border: `1px solid ${name === s.name ? "#7c3aed" : "#e2e8f0"}`, color: name === s.name ? "#7c3aed" : "#475569", fontWeight: name === s.name ? 700 : 400, transition: "all .15s" }}>
                  {s.name} · ₹{s.price}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>Service Name *</label>
            <input value={name} onChange={e => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Battery Replacement"
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>Additional Price (₹) *</label>
            <input type="number" value={price} onChange={e => { setPrice(e.target.value); setError(""); }}
              placeholder="e.g. 500" min="1"
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            {price && Number(price) > 0 && (
              <p style={{ fontSize: 12, color: "#7c3aed", margin: "4px 0 0", fontWeight: 600 }}>
                New total will be: ₹{(Number(order?.price || 0) + Number(price)).toLocaleString("en-IN")}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>Reason / Explanation *</label>
            <textarea value={reason} onChange={e => { setReason(e.target.value); setError(""); }}
              placeholder="e.g. While repairing the screen, we found the battery is swollen and needs immediate replacement for safety..."
              rows={3}
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>This message will be sent to the customer via SMS</p>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}>❌ {error}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} disabled={loading}
              style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 1, border: "none", borderRadius: 12, padding: "12px", background: loading ? "#94a3b8" : "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {loading ? "Sending..." : "📤 Send to Customer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Completion Form with image upload ─────────────────────────────────────────
function CompletionForm({ notes, setNotes, onConfirm, onCancel, loading }) {
  const [images,       setImages]       = useState([]);
  const [uploadingAny, setUploadingAny] = useState(false);
  const fileRef = useRef(null);

  const token = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").token || localStorage.getItem("token") || ""; }
    catch { return ""; }
  })();

  const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 5 - images.length);
    if (!validFiles.length) return;

    const newEntries = validFiles.map(file => ({
      file,
      previewUrl:  URL.createObjectURL(file),
      uploadedUrl: null,
      uploading:   true,
      error:       null,
    }));

    setImages(prev => [...prev, ...newEntries]);
    setUploadingAny(true);

    const uploaded = await Promise.all(newEntries.map(async (entry) => {
      try {
        const formData = new FormData();
        formData.append("file", entry.file);
        formData.append("folder", "repair-proofs");
        const res  = await fetch(`${BASE}/media/upload`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Upload failed");
        return { ...entry, uploadedUrl: data.data.url, uploading: false };
      } catch (e) {
        return { ...entry, uploading: false, error: e.message || "Upload failed" };
      }
    }));

    setImages(prev => {
      const existing = prev.filter(p => !newEntries.find(n => n.previewUrl === p.previewUrl));
      return [...existing, ...uploaded];
    });
    setUploadingAny(false);
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));
  const handleSubmit = () => onConfirm(notes, images.filter(img => img.uploadedUrl).map(img => img.uploadedUrl));
  const allDone   = images.length > 0 && images.every(img => !img.uploading);
  const hasErrors = images.some(img => img.error);

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">Complete Repair</p>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
          📸 Repair Proof Photos <span className="text-slate-400 font-normal">(optional, max 5)</span>
        </p>
        <div
          onClick={() => images.length < 5 && fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#22c55e"; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); e.currentTarget.style.borderColor = "#e2e8f0"; }}
          style={{ border: "2px dashed #e2e8f0", borderRadius: 12, padding: "16px", textAlign: "center", cursor: images.length >= 5 ? "not-allowed" : "pointer", background: images.length >= 5 ? "#f8fafc" : "#fafffe", transition: "border-color .2s" }}>
          <p style={{ fontSize: 24, marginBottom: 4 }}>📷</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: 0 }}>{images.length >= 5 ? "Max 5 photos reached" : "Click or drag photos here"}</p>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0" }}>Before/after repair, replaced parts, etc.</p>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} disabled={images.length >= 5} />
        </div>

        {images.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 10 }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: `2px solid ${img.error ? "#fca5a5" : img.uploadedUrl ? "#22c55e" : "#e2e8f0"}` }}>
                <img src={img.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {img.uploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 20, height: 20, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  </div>
                )}
                {img.uploadedUrl && !img.uploading && (
                  <div style={{ position: "absolute", top: 4, left: 4, background: "#22c55e", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>
                  </div>
                )}
                {img.error && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(220,38,38,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "#fff", fontSize: 10, textAlign: "center", padding: 4 }}>Failed</p>
                  </div>
                )}
                {!img.uploading && (
                  <button onClick={() => removeImage(i)}
                    style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 18, height: 18, color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {uploadingAny          && <p className="text-xs text-blue-500 mt-2 text-center">⏳ Uploading photos to Cloudinary...</p>}
        {allDone && !hasErrors && images.length > 0 && <p className="text-xs text-green-600 mt-2 text-center">✅ {images.filter(i => i.uploadedUrl).length} photo(s) ready</p>}
        {hasErrors             && <p className="text-xs text-red-500 mt-2 text-center">⚠️ Some uploads failed. Remove and retry.</p>}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Repair Notes (optional)</p>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Parts replaced, warranty info, technician notes..."
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 resize-none" />
      </div>

      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={loading || uploadingAny || hasErrors}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 text-sm transition flex items-center justify-center gap-2">
          {loading ? "Saving..." : uploadingAny ? "Uploading..." : "✓ Confirm Completed"}
        </button>
        <button onClick={onCancel}
          className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl py-2.5 text-sm transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Repair() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId  = searchParams.get("orderId");

  const [order,            setOrder]            = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [actionLoading,    setActionLoading]    = useState(false);
  const [notes,            setNotes]            = useState("");
  const [showComplete,     setShowComplete]     = useState(false);
  const [showReject,       setShowReject]       = useState(false);
  const [showExtraService, setShowExtraService] = useState(false);
  const [successMsg,       setSuccessMsg]       = useState("");

  const load = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const o = await getMyOrderById(orderId);
      setOrder(o);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [orderId]);

  const showSuccess = (msg, duration = 4000) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), duration);
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      if (action === "received") { await markReceived(orderId); showSuccess("Device marked as received!"); }
      if (action === "start")    { await startRepair(orderId);  showSuccess("Repair started!"); }
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (completionNotes, imageUrls) => {
    setActionLoading(true);
    try {
      await completeRepair(orderId, completionNotes, imageUrls);
      setShowComplete(false);
      setNotes("");
      showSuccess(`Repair completed! ${imageUrls.length > 0 ? `${imageUrls.length} proof photo(s) saved. ` : ""}Ready for delivery.`, 5000);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRepair = async (reason) => {
    setActionLoading(true);
    try {
      await rejectRepair(orderId, reason);
      setShowReject(false);
      showSuccess("Repair rejected. Customer has been notified via SMS.", 5000);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestExtraService = async (data) => {
    setActionLoading(true);
    try {
      await requestExtraService(orderId, data);
      setShowExtraService(false);
      showSuccess("Extra service request sent! Customer notified via SMS.", 5000);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!orderId) {
    return (
      <div className="content-shell p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No Order Selected</h2>
          <p className="text-slate-500 text-sm mb-4">Go to Orders and click View on an order to manage repair</p>
          <button onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-shell p-6 flex items-center justify-center py-24 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading order...
      </div>
    );
  }

  if (!order) {
    return <div className="content-shell p-6 text-center text-slate-500 py-16">Order not found</div>;
  }

  const isRepairRejected = order.status === "cancelled" && order.cancelReason?.startsWith("Repair rejected:");
  const hasPendingExtra  = order.extraServices?.some(s => s.status === "pending");

  return (
    <div className="content-shell p-6 space-y-5 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/orders")}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Repair: {order.orderNumber}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Repair management and status tracking</p>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 font-medium text-sm">{successMsg}</p>
        </div>
      )}

      {/* Repair rejected banner */}
      {isRepairRejected && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-bold text-sm">Repair Rejected — Customer Notified</p>
          </div>
          <p className="text-red-600 text-sm ml-8">{order.cancelReason}</p>
          <p className="text-red-400 text-xs ml-8 mt-1">SMS sent to {order.customer?.name} ({order.customer?.phone})</p>
        </div>
      )}

      {/* Pending extra service banner */}
      {hasPendingExtra && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span style={{ fontSize: 18 }}>⏳</span>
          <p className="text-violet-700 font-medium text-sm">
            Extra service request pending — awaiting customer approval via SMS
          </p>
        </div>
      )}

      {/* Status progress bar */}
      {order.status !== "cancelled" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <StepBar status={order.status} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Order info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Order Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-500" /> Order Info
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-slate-400 mb-1">Order ID</p><p className="font-semibold text-slate-800">{order.orderNumber}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Status</p><StatusBadge status={order.status} /></div>
              <div><p className="text-xs text-slate-400 mb-1">Service</p><p className="text-slate-700">{order.serviceType}</p></div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Price</p>
                <p className="font-semibold text-slate-800">
                  ₹{Number(order.price).toLocaleString("en-IN")}
                  {order.extraServices?.some(s => s.status === "approved") && (
                    <span className="text-xs text-violet-600 ml-1">(+extras)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Payment</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div><p className="text-xs text-slate-400 mb-1">Date</p><p className="text-slate-700">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p></div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Customer Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-700">{order.customer?.name}</span></div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href={`tel:${order.customer?.phone}`} className="text-blue-600 hover:underline">{order.customer?.phone}</a>
              </div>
              <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-slate-400 mt-0.5" /><span className="text-slate-700">{order.customer?.address}</span></div>
            </div>
          </div>

          {/* Device Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-500" /> Device Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-slate-400 mb-1">Brand</p><p className="text-slate-700">{order.deviceDetails?.brand}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Model</p><p className="text-slate-700">{order.deviceDetails?.model}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Color</p><p className="text-slate-700">{order.deviceDetails?.color || "—"}</p></div>
              <div className="col-span-2"><p className="text-xs text-slate-400 mb-1">Issue</p><p className="text-slate-700">{order.deviceDetails?.issue}</p></div>
            </div>
          </div>

          {/* ── Extra Services ─────────────────────────────────────────────── */}
          {(order.status === "repairing" || order.extraServices?.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-violet-500" /> Extra Services
                </h3>
                {order.status === "repairing" && !hasPendingExtra && (
                  <button onClick={() => setShowExtraService(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition">
                    + Add Service
                  </button>
                )}
                {hasPendingExtra && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                    ⏳ Awaiting Customer
                  </span>
                )}
              </div>

              {!order.extraServices?.length ? (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-sm">No extra services requested</p>
                  <p className="text-xs mt-1">Click "Add Service" if additional work is needed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {order.extraServices.map((svc, i) => (
                    <div key={i} style={{
                      border: `1.5px solid ${svc.status === "approved" ? "#bbf7d0" : svc.status === "rejected" ? "#fecaca" : "#ddd6fe"}`,
                      borderRadius: 12, padding: "12px 14px",
                      background: svc.status === "approved" ? "#f0fdf4" : svc.status === "rejected" ? "#fef2f2" : "#f5f3ff",
                    }}>
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <p className="font-semibold text-sm text-slate-800">{svc.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: svc.status === "approved" ? "#15803d" : svc.status === "rejected" ? "#b91c1c" : "#7c3aed" }}>
                            +₹{Number(svc.price).toLocaleString("en-IN")}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: svc.status === "approved" ? "#dcfce7" : svc.status === "rejected" ? "#fee2e2" : "#ede9fe", color: svc.status === "approved" ? "#15803d" : svc.status === "rejected" ? "#b91c1c" : "#7c3aed" }}>
                            {svc.status === "pending" ? "⏳ Awaiting" : svc.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{svc.reason}</p>
                      {svc.status === "pending" && <p className="text-xs text-violet-500 mt-1 font-medium">📱 Customer notified via SMS — awaiting response</p>}
                      {svc.respondedAt && <p className="text-xs text-slate-400 mt-1">Responded: {new Date(svc.respondedAt).toLocaleString("en-IN")}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Repair proof photos */}
          {order.images?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">📸 Repair Proof Photos</h3>
              <p className="text-xs text-slate-400 mb-4">{order.images.length} photo(s) uploaded by technician</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {order.images.map((url, i) => (
                  <div key={i} onClick={() => window.open(url, "_blank")}
                    style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "2px solid #e2e8f0", transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.border = "2px solid #f97316"; e.currentTarget.style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.border = "2px solid #e2e8f0"; e.currentTarget.style.transform = "scale(1)"; }}>
                    <img src={url} alt={`Proof ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">Click any photo to view full size</p>
            </div>
          )}

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Timeline
              </h3>
              <div className="space-y-3">
                {[...order.timeline].reverse().map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      entry.status === "cancelled"                  ? "bg-red-400"    :
                      entry.status === "completed"                  ? "bg-green-400"  :
                      entry.status?.startsWith("extra_service")     ? "bg-violet-400" :
                      "bg-blue-400"
                    }`} />
                    <div>
                      <p className={`font-medium capitalize ${
                        entry.status === "cancelled"                  ? "text-red-600"    :
                        entry.status?.startsWith("extra_service")     ? "text-violet-700" :
                        "text-slate-700"
                      }`}>
                        {entry.status === "cancelled" && entry.note?.startsWith("Cannot fix:") ? "❌ Repair Rejected" :
                         entry.status?.startsWith("extra_service")                             ? `🔧 ${entry.status.replace(/_/g, " ")}` :
                         entry.status?.replace(/_/g, " ")
                        }
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(entry.time).toLocaleString("en-IN")} · by {entry.by}
                      </p>
                      {entry.note && (
                        <p className={`text-xs mt-0.5 ${entry.status === "cancelled" ? "text-red-500 font-medium" : entry.status?.startsWith("extra_service") ? "text-violet-600" : "text-slate-500"}`}>
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Action panel */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Repair Actions</h3>

            {order.status === "cancelled" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-600 text-sm font-bold">{isRepairRejected ? "Repair Rejected" : "Order Cancelled"}</p>
                {order.cancelReason && <p className="text-red-400 text-xs mt-1 leading-relaxed">{order.cancelReason}</p>}
              </div>
            )}

            {order.status === "delivered" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium text-sm">Delivered Successfully</p>
              </div>
            )}

            {order.status === "completed" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-semibold text-sm">Repair Completed ✅</p>
                <p className="text-green-600 text-xs mt-1">Ready for delivery to customer</p>
                {order.images?.length > 0 && <p className="text-green-500 text-xs mt-1">📸 {order.images.length} proof photo(s) uploaded</p>}
              </div>
            )}

            <div className="space-y-3">

              {order.status === "confirmed" && (
                <button onClick={() => handleAction("received")} disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition">
                  <PackageCheck className="w-4 h-4" />
                  {actionLoading ? "Updating..." : "Mark as Received"}
                </button>
              )}

              {order.status === "picked" && (
                <button onClick={() => handleAction("start")} disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition">
                  <PlayCircle className="w-4 h-4" />
                  {actionLoading ? "Updating..." : "Start Repair"}
                </button>
              )}

              {order.status === "repairing" && (
                <>
                  {!showComplete ? (
                    <>
                      <button onClick={() => setShowComplete(true)}
                        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-3 text-sm transition">
                        <CheckCircle className="w-4 h-4" /> Mark as Completed
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>

                      <button onClick={() => setShowReject(true)}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-600 font-semibold rounded-xl py-3 text-sm transition">
                        <XCircle className="w-4 h-4" /> Cannot Fix — Reject Repair
                      </button>
                      <p className="text-xs text-slate-400 text-center">Customer will be notified via SMS</p>
                    </>
                  ) : (
                    <CompletionForm
                      notes={notes}
                      setNotes={setNotes}
                      onConfirm={handleComplete}
                      onCancel={() => setShowComplete(false)}
                      loading={actionLoading}
                    />
                  )}
                </>
              )}

              {["assigned", "placed"].includes(order.status) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                  <p className="text-orange-700 text-sm font-medium">Awaiting Acceptance</p>
                  <p className="text-orange-500 text-xs mt-1">Accept this order from the Orders page</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery agent */}
          {order.deliveryAgent && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm">Delivery Agent</h3>
              <p className="text-sm font-medium text-slate-700">{order.deliveryAgent.name || order.deliveryAgent.username}</p>
              {order.deliveryAgent.phone && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />{order.deliveryAgent.phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RejectRepairModal
        open={showReject}
        order={order}
        loading={actionLoading}
        onClose={() => setShowReject(false)}
        onConfirm={handleRejectRepair}
      />
      <ExtraServiceModal
        open={showExtraService}
        order={order}
        loading={actionLoading}
        onClose={() => setShowExtraService(false)}
        onConfirm={handleRequestExtraService}
      />
    </div>
  );
}