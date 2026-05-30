import { useEffect, useState, useCallback } from "react";
import {
  Plus, X, RefreshCw, Tag, ToggleLeft, ToggleRight,
  Trash2, Edit, CheckCircle, XCircle, TrendingUp,
  Percent, IndianRupee, Calendar, Users,
} from "lucide-react";
import { toast } from "sonner";
import httpClient from "../../services/httpClient.js";

const EMPTY_FORM = {
  code: "", description: "", type: "percentage", value: "",
  minOrderAmount: "", maxDiscount: "", maxUses: "",
  expiresAt: "", applicableTo: "all", brandName: "", serviceName: "",
  isActive: true,
};

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function CouponModal({ open, coupon, onClose, onSuccess }) {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(coupon ? {
        code:           coupon.code,
        description:    coupon.description || "",
        type:           coupon.type,
        value:          coupon.value,
        minOrderAmount: coupon.minOrderAmount || "",
        maxDiscount:    coupon.maxDiscount || "",
        maxUses:        coupon.maxUses || "",
        expiresAt:      coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
        applicableTo:   coupon.applicableTo || "all",
        brandName:      coupon.brandName || "",
        serviceName:    coupon.serviceName || "",
        isActive:       coupon.isActive !== false,
      } : EMPTY_FORM);
    }
  }, [open, coupon]);

  if (!open) return null;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error("Code is required"); return; }
    if (!form.value)       { toast.error("Discount value is required"); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        code:           form.code.toUpperCase().trim(),
        value:          Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount:    form.maxDiscount ? Number(form.maxDiscount) : undefined,
        maxUses:        Number(form.maxUses) || 0,
        expiresAt:      form.expiresAt || undefined,
        brandName:      form.applicableTo === "brand"   ? form.brandName   : undefined,
        serviceName:    form.applicableTo === "service" ? form.serviceName : undefined,
      };

      if (coupon) {
        await httpClient.put(`/discounts/${coupon._id}`, payload);
        toast.success("Coupon updated");
      } else {
        await httpClient.post("/discounts", payload);
        toast.success("Coupon created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-slate-800">{coupon ? "Edit Coupon" : "Create Coupon"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Code + Active */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Coupon Code *</label>
              <input name="code" value={form.code} onChange={handleChange}
                placeholder="e.g. SAVE20" className={inputCls}
                style={{ textTransform: "uppercase" }} disabled={!!coupon} />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}
                className="w-4 h-4 accent-orange-500" id="isActive" />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Description</label>
            <input name="description" value={form.description} onChange={handleChange}
              placeholder="e.g. 20% off on all screen repairs" className={inputCls} />
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Discount Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                Value * {form.type === "percentage" ? "(%)" : "(₹)"}
              </label>
              <input type="number" name="value" value={form.value} onChange={handleChange}
                placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 200"}
                min="1" max={form.type === "percentage" ? 100 : undefined}
                className={inputCls} />
            </div>
          </div>

          {/* Min order + Max discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Min Order (₹)</label>
              <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange}
                placeholder="0 = no minimum" min="0" className={inputCls} />
            </div>
            {form.type === "percentage" && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Max Discount (₹)</label>
                <input type="number" name="maxDiscount" value={form.maxDiscount} onChange={handleChange}
                  placeholder="Optional cap" min="0" className={inputCls} />
              </div>
            )}
          </div>

          {/* Max uses + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Max Uses</label>
              <input type="number" name="maxUses" value={form.maxUses} onChange={handleChange}
                placeholder="0 = unlimited" min="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Expiry Date</label>
              <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange}
                min={new Date().toISOString().slice(0, 10)} className={inputCls} />
            </div>
          </div>

          {/* Applicable to */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Applicable To</label>
            <select name="applicableTo" value={form.applicableTo} onChange={handleChange} className={inputCls}>
              <option value="all">All Orders</option>
              <option value="brand">Specific Brand</option>
              <option value="service">Specific Service</option>
            </select>
          </div>

          {form.applicableTo === "brand" && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Brand Name</label>
              <input name="brandName" value={form.brandName} onChange={handleChange}
                placeholder="e.g. Apple" className={inputCls} />
            </div>
          )}
          {form.applicableTo === "service" && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Service Name</label>
              <input name="serviceName" value={form.serviceName} onChange={handleChange}
                placeholder="e.g. Screen Replacement" className={inputCls} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl py-2.5 text-sm transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition">
              {saving ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Support() {
  const [coupons,  setCoupons]  = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState({ open: false, coupon: null });
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        httpClient.get("/discounts"),
        httpClient.get("/discounts/stats"),
      ]);
      setCoupons(cRes.data?.data ?? []);
      setStats(sRes.data?.data ?? null);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async coupon => {
    try {
      await httpClient.patch(`/discounts/${coupon._id}/toggle`);
      toast.success(`Coupon ${coupon.isActive ? "deactivated" : "activated"}`);
      load();
    } catch (err) { toast.error(err?.response?.data?.message || err.message); }
  };

  const handleDelete = async id => {
    setDeleting(id);
    try {
      await httpClient.delete(`/discounts/${id}`);
      toast.success("Coupon deleted");
      load();
    } catch (err) { toast.error(err?.response?.data?.message || err.message); }
    finally { setDeleting(null); }
  };

  const isExpired = coupon => coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Discount & Coupons</h2>
          <p className="text-slate-500 text-sm mt-1">Create and manage discount codes for customers</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setModal({ open: true, coupon: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition shadow-sm">
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Coupons"  value={stats?.total    ?? 0} icon={Tag}        color="text-orange-600" bg="bg-orange-50" />
        <StatCard label="Active"         value={stats?.active   ?? 0} icon={CheckCircle} color="text-green-600"  bg="bg-green-50"  />
        <StatCard label="Expired/Off"    value={stats?.expired  ?? 0} icon={XCircle}     color="text-red-600"    bg="bg-red-50"    />
        <StatCard label="Total Used"     value={stats?.totalUsed ?? 0} icon={Users}       color="text-blue-600"   bg="bg-blue-50"   />
      </div>

      {/* Coupons table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">All Coupons</h3>
          <span className="text-xs text-slate-400">{coupons.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Tag className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium text-slate-500">No coupons yet</p>
            <button onClick={() => setModal({ open: true, coupon: null })}
              className="mt-3 text-orange-500 text-sm font-medium hover:underline">
              Create your first coupon →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Code", "Type", "Value", "Min Order", "Uses", "Applies To", "Expiry", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map(coupon => {
                  const expired = isExpired(coupon);
                  return (
                    <tr key={coupon._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5">
                        <div>
                          <span className="font-bold text-slate-800 font-mono tracking-wide">{coupon.code}</span>
                          {coupon.description && <p className="text-xs text-slate-400 mt-0.5">{coupon.description}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          coupon.type === "percentage" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {coupon.type === "percentage" ? <Percent className="w-3 h-3" /> : <IndianRupee className="w-3 h-3" />}
                          {coupon.type === "percentage" ? "%" : "Flat"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                        {coupon.maxDiscount && coupon.type === "percentage" && (
                          <p className="text-xs text-slate-400">Max ₹{coupon.maxDiscount}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : "None"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {coupon.usedCount}{coupon.maxUses > 0 ? ` / ${coupon.maxUses}` : " / ∞"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {coupon.applicableTo === "brand"   && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">📱 {coupon.brandName}</span>}
                        {coupon.applicableTo === "service" && <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded">🔧 {coupon.serviceName}</span>}
                        {coupon.applicableTo === "all"     && <span className="text-xs text-slate-400">All orders</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {coupon.expiresAt
                          ? <span className={expired ? "text-red-500 font-semibold" : ""}>
                              {new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              {expired && " (Expired)"}
                            </span>
                          : "No expiry"
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          coupon.isActive && !expired
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${coupon.isActive && !expired ? "bg-green-500" : "bg-slate-400"}`} />
                          {coupon.isActive && !expired ? "Active" : expired ? "Expired" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModal({ open: true, coupon })}
                            className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleToggle(coupon)}
                            className={`transition ${coupon.isActive ? "text-green-500 hover:text-green-700" : "text-slate-400 hover:text-slate-600"}`}
                            title={coupon.isActive ? "Deactivate" : "Activate"}>
                            {coupon.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(coupon._id)} disabled={deleting === coupon._id}
                            className="text-red-400 hover:text-red-600 transition" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CouponModal
        open={modal.open}
        coupon={modal.coupon}
        onClose={() => setModal({ open: false, coupon: null })}
        onSuccess={load}
      />
    </div>
  );
}