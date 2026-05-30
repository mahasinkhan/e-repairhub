import { useEffect, useState, useCallback } from "react";
import {
  IndianRupee, Plus, Pencil, Trash2, RefreshCw,
  ChevronDown, Tag, Calculator, X, Package, Smartphone,
  AlertTriangle, CheckCircle2, Info, Download,
} from "lucide-react";
import { toast } from "sonner";
import httpClient from "../../services/httpClient.js";
import { exportToExcel } from "../../utils/exportToExcel.js";

function calcFinal(form) {
  const base     = Number(form.basePrice)    || 0;
  const pickup   = Number(form.pickupCharge) || 0;
  const urgent   = Number(form.urgentCharge) || 0;
  const discount = Number(form.discount)     || 0;
  return base + pickup + urgent - discount;
}

const EMPTY_FORM = { basePrice: "", pickupCharge: "0", urgentCharge: "0", discount: "0" };

// ─── Pricing Modal ────────────────────────────────────────────────────────────
function PricingModal({ open, pricing, modelId, serviceId, serviceName, catalogPrice, onClose, onSuccess }) {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pricing) {
      setForm({
        basePrice:    pricing.basePrice    ?? "",
        pickupCharge: pricing.pickupCharge ?? "0",
        urgentCharge: pricing.urgentCharge ?? "0",
        discount:     pricing.discount     ?? "0",
      });
    } else {
      setForm({ ...EMPTY_FORM, basePrice: catalogPrice ? String(catalogPrice) : "" });
    }
  }, [pricing, open, catalogPrice]);

  if (!open) return null;

  const finalPrice = calcFinal(form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.basePrice) return toast.error("Base price is required");
    if (finalPrice < 0)  return toast.error("Final price cannot be negative");
    setSaving(true);
    try {
      const body = {
        model: modelId, service: serviceId,
        basePrice:    Number(form.basePrice),
        pickupCharge: Number(form.pickupCharge) || 0,
        urgentCharge: Number(form.urgentCharge) || 0,
        discount:     Number(form.discount)     || 0,
        finalPrice,
      };
      pricing
        ? await httpClient.put(`/catalog/pricing/${pricing._id}`, body)
        : await httpClient.post("/catalog/pricing", body);
      toast.success(pricing ? "Pricing updated" : "Pricing added");
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">{pricing ? "Edit Pricing" : "Set Pricing"}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Service: <span className="font-medium text-green-600">{serviceName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Catalog price reference */}
          {catalogPrice > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-600">Catalog / Fallback Price</p>
                <p className="text-sm font-bold text-slate-700">₹{Number(catalogPrice).toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">This is used if no pricing rule is set. The final price below overrides it.</p>
              </div>
            </div>
          )}

          {/* Final price display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-xs text-green-600 font-medium mb-1">Final Customer Price</p>
            <p className={`text-3xl font-bold ${finalPrice < 0 ? "text-red-500" : "text-green-700"}`}>
              ₹{finalPrice.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-green-500 mt-1">base + pickup + urgent − discount</p>
            {catalogPrice > 0 && finalPrice !== catalogPrice && (
              <p className="text-[11px] text-green-600 mt-1 font-semibold">
                {finalPrice > catalogPrice
                  ? `▲ ₹${(finalPrice - catalogPrice).toLocaleString("en-IN")} above catalog`
                  : `▼ ₹${(catalogPrice - finalPrice).toLocaleString("en-IN")} below catalog`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Base Price (₹) *</label>
              <input type="number" min="0" value={form.basePrice}
                onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} placeholder="e.g. 1500"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Pickup Charge (₹)</label>
              <input type="number" min="0" value={form.pickupCharge}
                onChange={e => setForm(f => ({ ...f, pickupCharge: e.target.value }))} placeholder="e.g. 100"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Urgent Charge (₹)</label>
              <input type="number" min="0" value={form.urgentCharge}
                onChange={e => setForm(f => ({ ...f, urgentCharge: e.target.value }))} placeholder="e.g. 200"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Discount (₹)</label>
              <input type="number" min="0" value={form.discount}
                onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="e.g. 50"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition" />
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600"><span>Base price</span><span>₹{Number(form.basePrice || 0).toLocaleString("en-IN")}</span></div>
            {Number(form.pickupCharge) > 0 && <div className="flex justify-between text-blue-600"><span>+ Pickup charge</span><span>₹{Number(form.pickupCharge).toLocaleString("en-IN")}</span></div>}
            {Number(form.urgentCharge) > 0 && <div className="flex justify-between text-orange-600"><span>+ Urgent charge</span><span>₹{Number(form.urgentCharge).toLocaleString("en-IN")}</span></div>}
            {Number(form.discount)     > 0 && <div className="flex justify-between text-red-600"><span>− Discount</span><span>₹{Number(form.discount).toLocaleString("en-IN")}</span></div>}
            <div className="flex justify-between font-semibold text-green-700 border-t border-slate-200 pt-1.5 mt-1.5">
              <span>Final price (shown to customers)</span>
              <span>₹{finalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg py-2.5 text-sm transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition">
              {saving ? "Saving..." : pricing ? "Update Pricing" : "Set Pricing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Pricing() {
  const [brands,         setBrands]         = useState([]);
  const [models,         setModels]         = useState([]);
  const [services,       setServices]       = useState([]);
  const [pricingMap,     setPricingMap]     = useState({});
  const [selectedBrand,  setSelectedBrand]  = useState("");
  const [selectedModel,  setSelectedModel]  = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [modal,          setModal]          = useState({ open: false, pricing: null, service: null });

  // Load brands
  useEffect(() => {
    httpClient.get("/catalog/brands", { params: { limit: 100 } })
      .then(r => setBrands(r.data?.data ?? []))
      .catch(() => toast.error("Failed to load brands"));
  }, []);

  // Load models when brand changes
  useEffect(() => {
    if (!selectedBrand) { setModels([]); setSelectedModel(null); return; }
    setLoading(true);
    httpClient.get("/catalog/models", { params: { brand: selectedBrand, limit: 100 } })
      .then(r => setModels(r.data?.data ?? []))
      .catch(() => toast.error("Failed to load models"))
      .finally(() => setLoading(false));
  }, [selectedBrand]);

  // Load services + pricing when model changes
  const loadServicesAndPricing = useCallback(async () => {
    if (!selectedModel) { setServices([]); setPricingMap({}); return; }
    setPricingLoading(true);
    try {
      const [svcRes, priceRes] = await Promise.all([
        httpClient.get("/catalog/services", { params: { model: selectedModel._id, limit: 100 } }),
        httpClient.get("/catalog/pricing",  { params: { model: selectedModel._id, limit: 100 } }),
      ]);
      const svcs   = svcRes.data?.data   ?? [];
      const prices = priceRes.data?.data ?? [];
      setServices(svcs);
      const map = {};
      prices.forEach((p) => {
        const sid = p.service?._id || p.service;
        if (sid) map[String(sid)] = p;
      });
      setPricingMap(map);
    } catch {
      toast.error("Failed to load services/pricing");
    } finally {
      setPricingLoading(false);
    }
  }, [selectedModel]);

  useEffect(() => { loadServicesAndPricing(); }, [loadServicesAndPricing]);

  const handleDeletePricing = async (pricingId) => {
    if (!window.confirm("Remove this pricing? The service will fall back to catalog price.")) return;
    try {
      await httpClient.delete(`/catalog/pricing/${pricingId}`);
      toast.success("Pricing removed — service now uses catalog price");
      loadServicesAndPricing();
    } catch {
      toast.error("Failed to remove pricing");
    }
  };

  // ── Export to Excel ───────────────────────────────────────────────────────
  const handleExportPricing = () => {
    if (!services.length) return toast.error("Select a model first to export pricing");

    const selectedBrandName = brands.find(b => b._id === selectedBrand)?.name || "";

    // Sheet 1: Full pricing summary
    const summaryRows = services.map((s, i) => {
      const pricing    = pricingMap[s._id];
      const catalogPr  = s.catalogPrice ?? s.price ?? 0;
      const finalPr    = pricing?.finalPrice ?? catalogPr;
      return {
        "#":                i + 1,
        "Service":          s.name,
        "Description":      s.description || "",
        "Est. Time":        s.estimatedTime || "",
        "Model":            selectedModel?.name || "",
        "Brand":            selectedBrandName,
        "Catalog Price":    catalogPr,
        "Has Pricing Rule": pricing ? "Yes" : "No",
        "Base Price":       pricing?.basePrice      ?? "",
        "Pickup Charge":    pricing?.pickupCharge   ?? "",
        "Urgent Charge":    pricing?.urgentCharge   ?? "",
        "Discount":         pricing?.discount        ?? "",
        "Final Price":      finalPr,
        "Diff vs Catalog":  pricing ? (finalPr - catalogPr) : "",
        "Price Source":     pricing ? "Pricing Rule" : "Catalog Fallback",
        "Service Status":   s.status,
      };
    });

    // Sheet 2: Services needing pricing
    const unpricedRows = services
      .filter(s => !pricingMap[s._id])
      .map((s, i) => ({
        "#":             i + 1,
        "Service":       s.name,
        "Model":         selectedModel?.name || "",
        "Brand":         selectedBrandName,
        "Catalog Price": s.catalogPrice ?? s.price ?? 0,
        "Action Needed": "Set pricing rule in Pricing Management",
      }));

    // Sheet 3: All brands overview
    const allBrandRows = brands.map((b, i) => ({
      "#":      i + 1,
      "Brand":  b.name,
      "Status": b.status,
    }));

    // Sheet 4: All models for selected brand
    const modelRows = models.map((m, i) => ({
      "#":           i + 1,
      "Model":       m.name,
      "Series":      m.series || "",
      "Device Type": m.deviceType || "",
      "Status":      m.status,
    }));

    exportToExcel(
      [
        { name: "Pricing Summary",  rows: summaryRows  },
        { name: "Needs Pricing",    rows: unpricedRows.length ? unpricedRows : [{ Info: "All services are priced ✅" }] },
        { name: "Models Overview",  rows: modelRows.length ? modelRows : [{ Info: "No models loaded" }] },
        { name: "Brands Overview",  rows: allBrandRows },
      ],
      `pricing-${selectedModel?.name?.replace(/\s+/g, "-") || "all"}`
    );

    toast.success(`Exported pricing for ${services.length} services`);
  };

  const pricedCount   = services.filter((s) => pricingMap[s._id]).length;
  const unpricedCount = services.length - pricedCount;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pricing Management</h2>
          <p className="text-slate-500 text-sm mt-1">
            Set final customer prices per model and service. These <strong>override</strong> catalog prices shown at booking.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Export button */}
          <button
            onClick={handleExportPricing}
            disabled={!selectedModel || pricingLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>

          {/* Stats pills */}
          {selectedModel && (
            <div className="flex items-center gap-3">
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm text-center">
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-lg font-bold text-slate-800">{services.length}</p>
              </div>
              <div className="bg-white border border-green-200 rounded-xl px-4 py-2 shadow-sm text-center">
                <p className="text-xs text-green-600 flex items-center gap-1 justify-center"><CheckCircle2 className="w-3 h-3" />Priced</p>
                <p className="text-lg font-bold text-green-700">{pricedCount}</p>
              </div>
              <div className={`bg-white border rounded-xl px-4 py-2 shadow-sm text-center ${unpricedCount > 0 ? "border-amber-200" : "border-slate-200"}`}>
                <p className={`text-xs flex items-center gap-1 justify-center ${unpricedCount > 0 ? "text-amber-500" : "text-slate-400"}`}>
                  {unpricedCount > 0 && <AlertTriangle className="w-3 h-3" />}
                  Fallback
                </p>
                <p className={`text-lg font-bold ${unpricedCount > 0 ? "text-amber-600" : "text-slate-400"}`}>{unpricedCount}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Info banner ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <strong>How pricing works:</strong> Each service in Catalog has a base/fallback price. The Pricing page lets you override it with a detailed breakdown (base + pickup + urgent − discount = <strong>final price</strong>). The final price is what customers see and pay at booking. Services without a pricing rule use their catalog price as fallback.
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Select Brand
            </label>
            <div className="relative">
              <select value={selectedBrand} onChange={e => { setSelectedBrand(e.target.value); setSelectedModel(null); }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition appearance-none pr-8">
                <option value="">— Choose a brand —</option>
                {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Select Model
            </label>
            <div className="relative">
              <select value={selectedModel?._id ?? ""}
                onChange={e => { const m = models.find((m) => m._id === e.target.value); setSelectedModel(m || null); }}
                disabled={!selectedBrand || loading}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">{!selectedBrand ? "Select brand first" : loading ? "Loading models..." : "— Choose a model —"}</option>
                {models.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Services + Pricing table ── */}
      {!selectedModel ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Tag className="w-7 h-7 opacity-40" />
            </div>
            <p className="font-medium text-slate-500">Select a brand and model to manage pricing</p>
            <p className="text-sm mt-1 opacity-70">Prices are set per service per model</p>
          </div>
        </div>
      ) : pricingLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center py-16 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading services...
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Calculator className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No services found for {selectedModel.name}</p>
            <p className="text-xs mt-1 opacity-70">Add services in Catalog first, then set pricing here</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{selectedModel.name} — Services</h3>
              <p className="text-xs text-slate-400 mt-0.5">{pricedCount} of {services.length} services have pricing rules</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Inline export button */}
              <button
                onClick={handleExportPricing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Excel
              </button>
              <button onClick={loadServicesAndPricing} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Catalog Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Base</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pickup</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Urgent</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Discount</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Final Price</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => {
                  const pricing      = pricingMap[service._id];
                  const catalogPrice = service.catalogPrice ?? service.price ?? 0;
                  return (
                    <tr key={service._id} className={`hover:bg-slate-50 transition ${!pricing ? "bg-amber-50/30" : ""}`}>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{service.name}</p>
                          {service.description && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{service.description}</p>}
                          {service.estimatedTime && <p className="text-xs text-slate-400">{service.estimatedTime}</p>}
                          {!pricing && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full mt-1">
                              <AlertTriangle className="w-2.5 h-2.5" />Using catalog fallback
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Catalog price — always shown */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-slate-500 font-medium">₹{Number(catalogPrice).toLocaleString("en-IN")}</span>
                        {pricing && pricing.basePrice !== catalogPrice && (
                          <p className="text-[10px] text-slate-400">(overridden)</p>
                        )}
                      </td>

                      {pricing ? (
                        <>
                          <td className="px-4 py-4 text-right text-slate-700 font-medium">
                            ₹{Number(pricing.basePrice).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {pricing.pickupCharge > 0
                              ? <span className="text-blue-600">+₹{Number(pricing.pickupCharge).toLocaleString("en-IN")}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {pricing.urgentCharge > 0
                              ? <span className="text-orange-600">+₹{Number(pricing.urgentCharge).toLocaleString("en-IN")}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {pricing.discount > 0
                              ? <span className="text-red-500">−₹{Number(pricing.discount).toLocaleString("en-IN")}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div>
                              <span className="font-bold text-green-700 text-base">₹{Number(pricing.finalPrice).toLocaleString("en-IN")}</span>
                              {pricing.finalPrice !== catalogPrice && (
                                <p className={`text-[10px] font-semibold ${pricing.finalPrice > catalogPrice ? "text-rose-500" : "text-emerald-500"}`}>
                                  {pricing.finalPrice > catalogPrice ? "▲" : "▼"} ₹{Math.abs(pricing.finalPrice - catalogPrice).toLocaleString("en-IN")} vs catalog
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setModal({ open: true, pricing, service })}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={() => handleDeletePricing(pricing._id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition">
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-4 text-right text-slate-300 text-xs">—</td>
                          <td className="px-4 py-4 text-right text-slate-300 text-xs">—</td>
                          <td className="px-4 py-4 text-right text-slate-300 text-xs">—</td>
                          <td className="px-4 py-4 text-right text-slate-300 text-xs">—</td>
                          <td className="px-5 py-4 text-right">
                            <div>
                              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
                                ₹{Number(catalogPrice).toLocaleString("en-IN")} fallback
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1">No override set</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button onClick={() => setModal({ open: true, pricing: null, service })}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition mx-auto">
                              <Plus className="w-3 h-3" /> Set Price
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer progress bar */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full transition-all"
                  style={{ width: services.length > 0 ? `${(pricedCount / services.length) * 100}%` : "0%" }} />
              </div>
              <p className="text-xs text-slate-500 flex-shrink-0">{pricedCount}/{services.length} have pricing rules</p>
            </div>
            {unpricedCount > 0 && (
              <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {unpricedCount} service{unpricedCount > 1 ? "s are" : " is"} using catalog fallback price — customers will see the catalog price at booking.
              </p>
            )}
          </div>
        </div>
      )}

      <PricingModal
        open={modal.open}
        pricing={modal.pricing}
        modelId={selectedModel?._id}
        serviceId={modal.service?._id}
        serviceName={modal.service?.name}
        catalogPrice={modal.service?.catalogPrice ?? modal.service?.price ?? 0}
        onClose={() => setModal({ open: false, pricing: null, service: null })}
        onSuccess={loadServicesAndPricing}
      />
    </div>
  );
}