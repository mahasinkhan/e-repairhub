import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus, Pencil, Trash2, ChevronRight, Search, RefreshCw,
  Smartphone, Package, Wrench, X, ToggleLeft, ToggleRight,
  ImageIcon, Clock, IndianRupee, Layers, Tag, ChevronDown,
  ChevronUp, Zap, TrendingUp, Grid3X3, List, Star, AlertCircle,
  CheckCircle2, Circle, Hash, AlertTriangle, Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBrands, createBrand, updateBrand, deleteBrand, toggleBrandStatus,
  getModels, createModel, updateModel, deleteModel, toggleModelStatus,
  getServices, createService, updateService, deleteService, toggleServiceStatus,
} from "../../features/catalog/catalog.api.js";
import { exportToExcel } from "../../utils/exportToExcel.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Brand accent colours ─────────────────────────────────────────────────────
const BRAND_ACCENTS = [
  { bg: "bg-orange-500", light: "bg-orange-50", border: "border-orange-200", ring: "ring-orange-200", text: "text-orange-600", dot: "#f97316" },
  { bg: "bg-violet-500", light: "bg-violet-50", border: "border-violet-200", ring: "ring-violet-200", text: "text-violet-600", dot: "#7c3aed" },
  { bg: "bg-sky-500",    light: "bg-sky-50",    border: "border-sky-200",    ring: "ring-sky-200",    text: "text-sky-600",    dot: "#0284c7" },
  { bg: "bg-rose-500",   light: "bg-rose-50",   border: "border-rose-200",   ring: "ring-rose-200",   text: "text-rose-600",   dot: "#e11d48" },
  { bg: "bg-teal-500",   light: "bg-teal-50",   border: "border-teal-200",   ring: "ring-teal-200",   text: "text-teal-600",   dot: "#0d9488" },
  { bg: "bg-amber-500",  light: "bg-amber-50",  border: "border-amber-200",  ring: "ring-amber-200",  text: "text-amber-600",  dot: "#d97706" },
];
const getBrandAccent = (idx) => BRAND_ACCENTS[idx % BRAND_ACCENTS.length];

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function imgURL(src) {
  if (!src) return null;
  return src.startsWith("http") ? src : `${BASE_URL}${src}`;
}

function Avatar({ src, alt = "", size = "sm", icon: Icon = ImageIcon, accent }) {
  const dim    = size === "lg" ? "w-12 h-12" : size === "md" ? "w-9 h-9" : "w-8 h-8";
  const iconSz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  const url    = imgURL(src);
  if (!url) return (
    <div className={`${dim} rounded-xl flex items-center justify-center flex-shrink-0 ${accent?.light || "bg-slate-100"}`}>
      <Icon className={`${iconSz} ${accent?.text || "text-slate-300"}`} />
    </div>
  );
  return (
    <img src={url} alt={alt}
      className={`${dim} rounded-xl object-cover flex-shrink-0 border border-white/80 shadow-sm`}
      onError={e => { e.target.style.display = "none"; }} />
  );
}

function StatusPill({ status }) {
  return status === "active"
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 className="w-2.5 h-2.5" />Active</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400 border border-slate-200"><Circle className="w-2.5 h-2.5" />Inactive</span>;
}

function CountBadge({ n, color = "slate" }) {
  const map = { orange: "bg-orange-100 text-orange-600", blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600", slate: "bg-slate-100 text-slate-500" };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${map[color] || map.slate}`}>{n}</span>;
}

// ─── Service Price Badge ──────────────────────────────────────────────────────
function ServicePriceBadge({ service }) {
  const hasPricing   = service.pricing?.finalPrice != null;
  const finalPrice   = service.pricing?.finalPrice ?? service.catalogPrice ?? service.price ?? 0;
  const catalogPrice = service.catalogPrice ?? service.price ?? 0;
  const hasDiscount  = hasPricing && service.pricing?.discount > 0;

  if (!hasPricing) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
          <IndianRupee className="w-2.5 h-2.5" />{Number(catalogPrice).toLocaleString("en-IN")}
        </span>
        <span className="text-[9px] text-amber-500 font-semibold flex items-center gap-0.5">
          <AlertTriangle className="w-2.5 h-2.5" />No pricing set
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
        <IndianRupee className="w-2.5 h-2.5" />{Number(finalPrice).toLocaleString("en-IN")}
        <span className="text-[9px] font-semibold text-emerald-500 ml-0.5">final</span>
      </span>
      {hasDiscount && (
        <span className="text-[9px] text-slate-400 line-through ml-1">
          ₹{Number(service.pricing.basePrice).toLocaleString("en-IN")} base
        </span>
      )}
      {catalogPrice !== finalPrice && (
        <span className="text-[9px] text-slate-400 ml-1">
          catalog: ₹{Number(catalogPrice).toLocaleString("en-IN")}
        </span>
      )}
    </div>
  );
}

// ─── Search box ───────────────────────────────────────────────────────────────
function SearchBox({ value, onChange, placeholder, disabled, color = "orange" }) {
  const ring = { orange: "focus:ring-orange-400 focus:border-orange-400", blue: "focus:ring-blue-400 focus:border-blue-400", green: "focus:ring-green-400 focus:border-green-400" };
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className={`w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition placeholder:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed ${ring[color]}`} />
    </div>
  );
}

// ─── Panel header ─────────────────────────────────────────────────────────────
function PanelHeader({ icon: Icon, color, title, count, onAdd, disabled }) {
  const cfg = {
    orange: { iconBg: "bg-gradient-to-br from-orange-400 to-orange-600", btn: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-200" },
    blue:   { iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",     btn: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200" },
    green:  { iconBg: "bg-gradient-to-br from-green-400 to-green-600",   btn: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-200" },
  }[color];

  return (
    <div className="px-4 py-3.5 border-b border-slate-100/80 flex items-center justify-between flex-shrink-0 bg-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 ${cfg.iconBg} rounded-xl flex items-center justify-center shadow-md`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">{title}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{count}</p>
        </div>
      </div>
      <button onClick={onAdd} disabled={disabled}
        className={`flex items-center gap-1.5 px-3.5 py-2 ${cfg.btn} text-white rounded-xl text-xs font-bold shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95`}>
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle, color = "slate" }) {
  const c = { orange: "text-orange-300 bg-orange-50", blue: "text-blue-300 bg-blue-50", green: "text-green-300 bg-green-50", slate: "text-slate-300 bg-slate-50" }[color];
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center select-none">
      <div className={`w-16 h-16 ${c.split(" ")[1]} rounded-2xl flex items-center justify-center mb-4 shadow-inner`}>
        <Icon className={`w-8 h-8 ${c.split(" ")[0]}`} />
      </div>
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      {subtitle && <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function SkeletonList({ rows = 4 }) {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="w-8 h-8 rounded-xl bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 bg-slate-200 rounded-full w-3/4" />
            <div className="h-2 bg-slate-200 rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BRAND MODAL ─────────────────────────────────────────────────────────────
function BrandModal({ open, brand, onClose, onSuccess }) {
  const [form, setForm]           = useState({ name: "", description: "", status: "active" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (brand) {
      setForm({ name: brand.name ?? "", description: brand.description ?? "", status: brand.status ?? "active" });
      setPreview(imgURL(brand.image));
    } else {
      setForm({ name: "", description: "", status: "active" });
      setPreview(null);
    }
    setImageFile(null);
  }, [brand, open]);

  if (!open) return null;

  const handleFile = e => { const f = e.target.files[0]; if (!f) return; setImageFile(f); setPreview(URL.createObjectURL(f)); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Brand name is required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim()); fd.append("description", form.description.trim()); fd.append("status", form.status);
      if (imageFile) fd.append("image", imageFile);
      brand ? await updateBrand(brand._id, fd) : await createBrand(fd);
      toast.success(brand ? "Brand updated!" : "Brand created!");
      onSuccess(); onClose();
    } catch (err) { toast.error(err?.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title={brand ? "Edit Brand" : "New Brand"} subtitle="Device manufacturer or OEM" onClose={onClose} accentClass="from-orange-500 to-amber-500">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-dashed border-orange-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-orange-400 transition group flex-shrink-0">
            {preview
              ? <img src={preview} alt="" className="w-full h-full object-cover" />
              : <div className="text-center"><Package className="w-7 h-7 text-orange-300 mx-auto mb-0.5 group-hover:text-orange-400 transition" /><span className="text-[9px] text-orange-300 font-medium">Click to upload</span></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Brand Name <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Apple, Samsung, OnePlus"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description (optional)"
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition resize-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
          <div className="flex gap-2">
            {["active", "inactive"].map(s => (
              <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition ${form.status === s ? (s === "active" ? "bg-emerald-500 border-emerald-500 text-white shadow-md" : "bg-slate-600 border-slate-600 text-white shadow-md") : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ModalFooter onCancel={onClose} saving={saving} label={brand ? "Update Brand" : "Create Brand"} color="orange" />
      </form>
    </ModalShell>
  );
}

// ─── MODEL MODAL ─────────────────────────────────────────────────────────────
const DEVICE_TYPES = ["Smartphone", "Tablet", "Laptop", "Smartwatch", "Earbuds", "Other"];
const BRAND_SERIES = {
  apple:    ["iPhone 16 Series", "iPhone 15 Series", "iPhone 14 Series", "iPhone 13 Series", "iPhone 12 Series", "iPad Series", "MacBook Series", "Apple Watch Series"],
  samsung:  ["Galaxy S25 Series", "Galaxy S24 Series", "Galaxy S23 Series", "Galaxy A Series", "Galaxy M Series", "Galaxy Z Fold Series", "Galaxy Z Flip Series"],
  oneplus:  ["OnePlus 13 Series", "OnePlus 12 Series", "OnePlus 11 Series", "OnePlus Nord Series"],
  xiaomi:   ["Xiaomi 14 Series", "Redmi Note Series", "Redmi Series", "POCO Series"],
  oppo:     ["Reno Series", "Find Series", "A Series", "F Series"],
  vivo:     ["V Series", "Y Series", "X Series", "T Series"],
  realme:   ["GT Series", "Narzo Series", "C Series", "Number Series"],
  motorola: ["Edge Series", "Moto G Series", "Moto E Series", "Razr Series"],
  nokia:    ["G Series", "C Series", "X Series"],
  google:   ["Pixel 9 Series", "Pixel 8 Series", "Pixel 7 Series", "Pixel A Series"],
};

function ModelModal({ open, model, brandId, brandName, onClose, onSuccess }) {
  const [form, setForm]           = useState({ name: "", series: "", deviceType: "Smartphone", status: "active" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [showSeries, setShowSeries] = useState(false);
  const fileRef = useRef();
  const suggestions = BRAND_SERIES[brandName?.toLowerCase()] ?? [];

  useEffect(() => {
    if (model) {
      setForm({ name: model.name ?? "", series: model.series ?? "", deviceType: model.deviceType ?? "Smartphone", status: model.status ?? "active" });
      setPreview(imgURL(model.image));
    } else {
      setForm({ name: "", series: "", deviceType: "Smartphone", status: "active" });
      setPreview(null);
    }
    setImageFile(null);
  }, [model, open]);

  if (!open) return null;

  const handleFile = e => { const f = e.target.files[0]; if (!f) return; setImageFile(f); setPreview(URL.createObjectURL(f)); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!brandId) return toast.error("Please select a brand first");
    if (!form.name.trim()) return toast.error("Model name is required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim()); fd.append("brand", brandId);
      fd.append("series", form.series.trim()); fd.append("deviceType", form.deviceType); fd.append("status", form.status);
      if (imageFile) fd.append("image", imageFile);
      model ? await updateModel(model._id, fd) : await createModel(fd);
      toast.success(model ? "Model updated!" : "Model created!");
      onSuccess(); onClose();
    } catch (err) { toast.error(err?.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title={model ? "Edit Model" : "New Model"} subtitle={brandName ? `Adding to ${brandName}` : "Select a brand first"} onClose={onClose} accentClass="from-blue-500 to-indigo-500">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition group flex-shrink-0">
            {preview
              ? <img src={preview} alt="" className="w-full h-full object-cover" />
              : <div className="text-center"><Smartphone className="w-7 h-7 text-blue-300 mx-auto mb-0.5 group-hover:text-blue-400 transition" /><span className="text-[9px] text-blue-300 font-medium">Click to upload</span></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Model Name <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={brandName === "Apple" ? "iPhone 15, iPhone 15 Pro Max…" : "e.g. Galaxy S25 Ultra"}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition" />
            <label className="block text-xs font-semibold text-slate-600 mt-2 mb-1.5">Device Type</label>
            <select value={form.deviceType} onChange={e => setForm(f => ({ ...f, deviceType: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition">
              {DEVICE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-slate-400" /> Series <span className="text-slate-400 font-normal">(optional)</span></label>
          <input value={form.series} onChange={e => setForm(f => ({ ...f, series: e.target.value }))}
            onFocus={() => setShowSeries(true)} onBlur={() => setTimeout(() => setShowSeries(false), 150)}
            placeholder="e.g. iPhone 15 Series, Galaxy S24 Series"
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition" />
          {showSeries && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
              <p className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Suggestions for {brandName}</p>
              <div className="max-h-44 overflow-y-auto p-2">
                {suggestions.map(s => (
                  <button key={s} type="button" onMouseDown={() => setForm(f => ({ ...f, series: s }))}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 opacity-50" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
          <div className="flex gap-2">
            {["active", "inactive"].map(s => (
              <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition ${form.status === s ? (s === "active" ? "bg-emerald-500 border-emerald-500 text-white shadow-md" : "bg-slate-600 border-slate-600 text-white shadow-md") : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ModalFooter onCancel={onClose} saving={saving} label={model ? "Update Model" : "Add Model"} color="blue" />
      </form>
    </ModalShell>
  );
}

// ─── SERVICE MODAL ────────────────────────────────────────────────────────────
function ServiceModal({ open, service, modelId, modelName, onClose, onSuccess }) {
  const [form, setForm]           = useState({ name: "", description: "", estimatedTime: "", price: "", status: "active" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (service) {
      const editablePrice = service.catalogPrice ?? service.price ?? "";
      setForm({ name: service.name ?? "", description: service.description ?? "", estimatedTime: service.estimatedTime ?? "", price: editablePrice, status: service.status ?? "active" });
      setPreview(imgURL(service.image));
    } else {
      setForm({ name: "", description: "", estimatedTime: "", price: "", status: "active" });
      setPreview(null);
    }
    setImageFile(null);
  }, [service, open]);

  if (!open) return null;

  const handleFile = e => { const f = e.target.files[0]; if (!f) return; setImageFile(f); setPreview(URL.createObjectURL(f)); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!modelId) return toast.error("Please select a model first");
    if (!form.name.trim()) return toast.error("Service name is required");
    if (!form.price) return toast.error("Base price is required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim()); fd.append("description", form.description.trim());
      fd.append("estimatedTime", form.estimatedTime.trim()); fd.append("price", form.price);
      fd.append("status", form.status); fd.append("model", modelId);
      if (imageFile) fd.append("image", imageFile);
      service ? await updateService(service._id, fd) : await createService(fd);
      toast.success(service ? "Service updated!" : "Service created!");
      onSuccess(); onClose();
    } catch (err) { toast.error(err?.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title={service ? "Edit Service" : "New Service"} subtitle={modelName ? `For ${modelName}` : "Select a model first"} onClose={onClose} accentClass="from-green-500 to-emerald-500">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-green-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-green-400 transition group flex-shrink-0">
            {preview
              ? <img src={preview} alt="" className="w-full h-full object-cover" />
              : <div className="text-center"><Wrench className="w-7 h-7 text-green-300 mx-auto mb-0.5 group-hover:text-green-400 transition" /><span className="text-[9px] text-green-300 font-medium">Click to upload</span></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service Name <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Screen Replacement, Battery Replacement"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400 transition" />
            <label className="block text-xs font-semibold text-slate-600 mt-3 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400 transition resize-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <IndianRupee className="w-3 h-3" /> Base / Fallback Price <span className="text-red-400">*</span>
            </label>
            <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="1500"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400 transition" />
            <p className="text-[10px] text-slate-400 mt-1">Used if no pricing rule is set. Go to Pricing page to set final price.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Est. Time</label>
            <input value={form.estimatedTime} onChange={e => setForm(f => ({ ...f, estimatedTime: e.target.value }))} placeholder="2-3 hours"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400 transition" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-700 leading-relaxed">
            <strong>Tip:</strong> The price here is a fallback. To set the final customer price with pickup/urgent/discount charges, go to the <strong>Pricing</strong> page.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
          <div className="flex gap-2">
            {["active", "inactive"].map(s => (
              <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition ${form.status === s ? (s === "active" ? "bg-emerald-500 border-emerald-500 text-white shadow-md" : "bg-slate-600 border-slate-600 text-white shadow-md") : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ModalFooter onCancel={onClose} saving={saving} label={service ? "Update Service" : "Add Service"} color="green" />
      </form>
    </ModalShell>
  );
}

// ─── Shared modal shell ───────────────────────────────────────────────────────
function ModalShell({ title, subtitle, onClose, accentClass, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`h-1.5 w-full bg-gradient-to-r ${accentClass}`} />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, saving, label, color }) {
  const btn = { orange: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-200", blue: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-200", green: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-200" }[color];
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl py-2.5 text-sm transition">Cancel</button>
      <button type="submit" disabled={saving} className={`flex-1 ${btn} disabled:opacity-60 text-white font-bold rounded-xl py-2.5 text-sm transition shadow-lg active:scale-95`}>
        {saving ? <span className="flex items-center justify-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</span> : label}
      </button>
    </div>
  );
}

// ─── Model grouping ───────────────────────────────────────────────────────────
function groupModelsBySeries(models) {
  const groups = {};
  models.forEach(m => { const k = m.series?.trim() || "Ungrouped"; (groups[k] = groups[k] || []).push(m); });
  return Object.entries(groups).sort(([a], [b]) => {
    if (a === "Ungrouped") return 1; if (b === "Ungrouped") return -1; return a.localeCompare(b);
  });
}

// ─── Action buttons on hover ──────────────────────────────────────────────────
function RowActions({ onToggle, onEdit, onDelete, status }) {
  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150" onClick={e => e.stopPropagation()}>
      <button onClick={onToggle} title="Toggle status" className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition">
        {status === "active" ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
      </button>
      <button onClick={onEdit} title="Edit" className="p-1.5 rounded-lg hover:bg-blue-50 transition text-slate-400 hover:text-blue-500">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={onDelete} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 transition text-slate-400 hover:text-red-500">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Stats card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, total, active, color, disabled, hint, warning }) {
  const cfg = {
    orange: { bg: "from-orange-50 to-amber-50",  border: "border-orange-100", icon: "text-orange-500 bg-orange-100", text: "text-orange-700" },
    blue:   { bg: "from-blue-50 to-indigo-50",   border: "border-blue-100",   icon: "text-blue-500 bg-blue-100",   text: "text-blue-700"   },
    green:  { bg: "from-green-50 to-emerald-50", border: "border-green-100",  icon: "text-green-500 bg-green-100", text: "text-green-700"  },
  }[color];

  return (
    <div className={`bg-gradient-to-br ${cfg.bg} border ${cfg.border} rounded-2xl px-4 py-3 flex items-center gap-3 transition-opacity ${disabled ? "opacity-40" : ""}`}>
      <div className={`w-9 h-9 rounded-xl ${cfg.icon} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        {hint
          ? <p className="text-[11px] text-slate-400 italic">{hint}</p>
          : <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-extrabold ${cfg.text} leading-none`}>{total}</span>
                {total > 0 && <span className="text-[10px] text-slate-400 font-medium">{active} active</span>}
              </div>
              {warning && (
                <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />{warning}
                </p>
              )}
            </div>
        }
      </div>
    </div>
  );
}

// ─── Series group ─────────────────────────────────────────────────────────────
function SeriesGroup({ series, models, selectedModel, onSelect, onEdit, onToggle, onDelete }) {
  const [open, setOpen] = useState(true);
  const isUngrouped     = series === "Ungrouped";
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition mb-1 group ${isUngrouped ? "opacity-60" : ""}`}>
        <Layers className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-1 text-left truncate">{series}</p>
        <CountBadge n={models.length} color="blue" />
        {open ? <ChevronUp className="w-3 h-3 text-slate-300 group-hover:text-slate-400 transition" /> : <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-slate-400 transition" />}
      </button>
      {open && (
        <div className="space-y-1 pl-1">
          {models.map(m => <ModelRow key={m._id} model={m} selected={selectedModel} onSelect={onSelect} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

// ─── Model row ────────────────────────────────────────────────────────────────
function ModelRow({ model, selected, onSelect, onEdit, onToggle, onDelete }) {
  const isSelected = selected?._id === model._id;
  return (
    <div onClick={() => onSelect(model)}
      className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-150 group ${isSelected ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-slate-50 border border-transparent"}`}>
      <Avatar src={model.image} alt={model.name} icon={Smartphone} accent={{ light: "bg-blue-50", text: "text-blue-300" }} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${isSelected ? "text-blue-700" : "text-slate-700"}`}>{model.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-medium">{model.deviceType}</span>
          <StatusPill status={model.status} />
        </div>
      </div>
      <RowActions status={model.status} onToggle={() => onToggle(model)} onEdit={() => onEdit(model)} onDelete={() => onDelete(model)} />
      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition ${isSelected ? "text-blue-400" : "text-slate-200 group-hover:text-slate-300"}`} />
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Catalog() {
  const [brands,        setBrands]        = useState([]);
  const [brandSearch,   setBrandSearch]   = useState("");
  const [brandLoading,  setBrandLoading]  = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandModal,    setBrandModal]    = useState({ open: false, brand: null });

  const [models,        setModels]        = useState([]);
  const [modelSearch,   setModelSearch]   = useState("");
  const [modelLoading,  setModelLoading]  = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelModal,    setModelModal]    = useState({ open: false, model: null });

  const [services,       setServices]       = useState([]);
  const [serviceSearch,  setServiceSearch]  = useState("");
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceModal,   setServiceModal]   = useState({ open: false, service: null });

  // ── Data loaders ──────────────────────────────────────────────────────────
  const loadBrands = useCallback(async () => {
    setBrandLoading(true);
    try { const r = await getBrands({ search: brandSearch, limit: 100 }); setBrands(r.data ?? []); }
    catch { toast.error("Failed to load brands"); } finally { setBrandLoading(false); }
  }, [brandSearch]);

  const loadModels = useCallback(async () => {
    if (!selectedBrand) { setModels([]); return; }
    setModelLoading(true);
    try { const r = await getModels({ brand: selectedBrand._id, search: modelSearch, limit: 200 }); setModels(r.data ?? []); }
    catch { toast.error("Failed to load models"); } finally { setModelLoading(false); }
  }, [selectedBrand, modelSearch]);

  const loadServices = useCallback(async () => {
    if (!selectedModel) { setServices([]); return; }
    setServiceLoading(true);
    try { const r = await getServices({ model: selectedModel._id, search: serviceSearch, limit: 200 }); setServices(r.data ?? []); }
    catch { toast.error("Failed to load services"); } finally { setServiceLoading(false); }
  }, [selectedModel, serviceSearch]);

  useEffect(() => { loadBrands(); }, [loadBrands]);
  useEffect(() => { loadModels(); }, [loadModels]);
  useEffect(() => { loadServices(); }, [loadServices]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectBrand = b => { setSelectedBrand(p => p?._id === b._id ? null : b); setSelectedModel(null); setServices([]); };

  const handleToggleBrand = async b => {
    try { await toggleBrandStatus(b._id); loadBrands(); toast.success("Status updated"); } catch { toast.error("Failed"); }
  };
  const handleDeleteBrand = async b => {
    if (!window.confirm(`Delete "${b.name}"? All its models and services will also be deleted.`)) return;
    try {
      await deleteBrand(b._id); toast.success("Brand deleted");
      if (selectedBrand?._id === b._id) { setSelectedBrand(null); setSelectedModel(null); }
      loadBrands();
    } catch { toast.error("Failed to delete"); }
  };

  const handleToggleModel = async m => {
    try { await toggleModelStatus(m._id); loadModels(); toast.success("Status updated"); } catch { toast.error("Failed"); }
  };
  const handleDeleteModel = async m => {
    if (!window.confirm(`Delete model "${m.name}"?`)) return;
    try {
      await deleteModel(m._id); toast.success("Model deleted");
      if (selectedModel?._id === m._id) setSelectedModel(null);
      loadModels();
    } catch { toast.error("Failed to delete"); }
  };

  const handleToggleService = async s => {
    try { await toggleServiceStatus(s._id); loadServices(); toast.success("Status updated"); } catch { toast.error("Failed"); }
  };
  const handleDeleteService = async s => {
    if (!window.confirm(`Delete service "${s.name}"?`)) return;
    try { await deleteService(s._id); toast.success("Service deleted"); loadServices(); }
    catch { toast.error("Failed to delete"); }
  };

  // ── Export to Excel ───────────────────────────────────────────────────────
  const handleExportCatalog = () => {
    if (!brands.length) return toast.error("No catalog data to export");

    const brandRows = brands.map((b, i) => ({
      "#":           i + 1,
      "Brand Name":  b.name,
      "Status":      b.status,
      "Description": b.description || "",
      "Created At":  b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : "",
    }));

    const modelRows = models.length > 0 ? models.map((m, i) => ({
      "#":           i + 1,
      "Model Name":  m.name,
      "Brand":       typeof m.brand === "object" ? m.brand?.name : selectedBrand?.name || "",
      "Series":      m.series || "",
      "Device Type": m.deviceType || "",
      "Status":      m.status,
      "Created At":  m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN") : "",
    })) : [{ "Info": "No models loaded — select a brand first" }];

    const serviceRows = services.length > 0 ? services.map((s, i) => ({
      "#":              i + 1,
      "Service Name":   s.name,
      "Model":          typeof s.model === "object" ? s.model?.name : selectedModel?.name || "",
      "Brand":          selectedBrand?.name || "",
      "Description":    s.description || "",
      "Est. Time":      s.estimatedTime || "",
      "Catalog Price":  s.catalogPrice ?? s.price ?? 0,
      "Final Price":    s.pricing?.finalPrice ?? s.price ?? 0,
      "Has Pricing":    s.pricing ? "Yes" : "No (fallback)",
      "Pricing Base":   s.pricing?.basePrice   ?? "",
      "Pickup Charge":  s.pricing?.pickupCharge ?? "",
      "Urgent Charge":  s.pricing?.urgentCharge ?? "",
      "Discount":       s.pricing?.discount      ?? "",
      "Status":         s.status,
      "Created At":     s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "",
    })) : [{ "Info": "No services loaded — select a model first" }];

    exportToExcel(
      [
        { name: "Brands",   rows: brandRows   },
        { name: "Models",   rows: modelRows   },
        { name: "Services", rows: serviceRows },
      ],
      `catalog-${selectedBrand?.name || "all"}`
    );

    toast.success(`Exported ${brandRows.length} brands, ${models.length} models, ${services.length} services`);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredBrands = brandSearch.trim()
    ? brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
    : brands;

  const filteredModels = modelSearch.trim()
    ? models.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()) || m.series?.toLowerCase().includes(modelSearch.toLowerCase()))
    : null;
  const groupedModels = groupModelsBySeries(models);

  const filteredServices = serviceSearch.trim()
    ? services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
    : services;

  const activeBrands     = brands.filter(b => b.status === "active").length;
  const activeModels     = models.filter(m => m.status === "active").length;
  const activeServices   = services.filter(s => s.status === "active").length;
  const unpricedServices = services.filter(s => !s.pricing).length;

  return (
    <div className="space-y-4 h-full flex flex-col">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Catalog Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">Brands → Series → Models → Repair Services</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Export Excel button */}
          <button
            onClick={handleExportCatalog}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>

          {/* Breadcrumb trail */}
          <nav className="flex items-center gap-1 text-xs flex-wrap">
            <span className={`px-3 py-1.5 rounded-xl font-semibold transition ${!selectedBrand ? "bg-orange-100 text-orange-700 border border-orange-200" : "bg-slate-100 text-slate-500"}`}>
              All Brands
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={`px-3 py-1.5 rounded-xl font-semibold transition ${selectedBrand && !selectedModel ? "bg-blue-100 text-blue-700 border border-blue-200" : selectedBrand ? "bg-slate-100 text-slate-500" : "text-slate-300"}`}>
              {selectedBrand ? selectedBrand.name : "Select Brand"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={`px-3 py-1.5 rounded-xl font-semibold transition ${selectedModel ? "bg-green-100 text-green-700 border border-green-200" : "text-slate-300"}`}>
              {selectedModel ? selectedModel.name : "Select Model"}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        <StatCard icon={Package}    label="Brands"   total={brands.length}   active={activeBrands}   color="orange" />
        <StatCard icon={Smartphone} label="Models"   total={models.length}   active={activeModels}   color="blue"   disabled={!selectedBrand} hint={!selectedBrand ? "Select a brand" : undefined} />
        <StatCard icon={Wrench}     label="Services" total={services.length} active={activeServices} color="green"  disabled={!selectedModel} hint={!selectedModel ? "Select a model" : undefined}
          warning={unpricedServices > 0 ? `${unpricedServices} without pricing` : undefined} />
      </div>

      {/* ── Three columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0" style={{ height: "calc(100vh - 310px)", minHeight: "480px" }}>

        {/* ── BRANDS ── */}
        <div className={`bg-white/80 backdrop-blur border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-200 ${selectedBrand ? "border-orange-200 ring-2 ring-orange-100/80" : "border-slate-200"}`}>
          <PanelHeader icon={Package} color="orange" title="Brands" count={`${filteredBrands.length} of ${brands.length} brand${brands.length !== 1 ? "s" : ""}`}
            onAdd={() => setBrandModal({ open: true, brand: null })} />
          <div className="px-3 py-2.5 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
            <SearchBox value={brandSearch} onChange={setBrandSearch} placeholder="Search brands…" color="orange" />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {brandLoading ? <SkeletonList rows={5} />
              : filteredBrands.length === 0
                ? <EmptyState icon={Package} title="No brands found" subtitle={brandSearch ? "Try a different search term" : "Click Add to create your first brand"} color="orange" />
                : (
                  <div className="p-2.5 space-y-1">
                    {filteredBrands.map((brand) => {
                      const acc        = getBrandAccent(brands.findIndex(b => b._id === brand._id));
                      const isSelected = selectedBrand?._id === brand._id;
                      return (
                        <div key={brand._id} onClick={() => handleSelectBrand(brand)}
                          className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-150 group ${isSelected ? `${acc.light} ${acc.border} border shadow-sm` : "hover:bg-slate-50 border border-transparent"}`}>
                          <div className="relative flex-shrink-0">
                            <Avatar src={brand.image} alt={brand.name} icon={Package} accent={acc} />
                            {isSelected && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: acc.dot }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isSelected ? acc.text : "text-slate-700"}`}>{brand.name}</p>
                            <StatusPill status={brand.status} />
                          </div>
                          <RowActions status={brand.status} onToggle={() => handleToggleBrand(brand)}
                            onEdit={() => setBrandModal({ open: true, brand })} onDelete={() => handleDeleteBrand(brand)} />
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition ${isSelected ? acc.text : "text-slate-200 group-hover:text-slate-300"}`} />
                        </div>
                      );
                    })}
                  </div>
                )}
          </div>
        </div>

        {/* ── MODELS ── */}
        <div className={`bg-white/80 backdrop-blur border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-200 ${selectedModel ? "border-blue-200 ring-2 ring-blue-100/80" : selectedBrand ? "border-blue-200" : "border-slate-200"}`}>
          <PanelHeader icon={Smartphone} color="blue"
            title="Models" count={selectedBrand ? `${models.length} in ${selectedBrand.name}` : "Select a brand"}
            onAdd={() => { if (!selectedBrand) return toast.error("Select a brand first"); setModelModal({ open: true, model: null }); }} />
          <div className="px-3 py-2.5 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
            <SearchBox value={modelSearch} onChange={setModelSearch} placeholder={selectedBrand ? "Search models or series…" : "Select a brand first"} disabled={!selectedBrand} color="blue" />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {!selectedBrand
              ? <EmptyState icon={ChevronRight} title="No brand selected" subtitle="Click any brand on the left to view its models" color="slate" />
              : modelLoading ? <SkeletonList rows={5} />
                : models.length === 0
                  ? <EmptyState icon={Smartphone} title="No models yet" subtitle={`Add models to ${selectedBrand.name} using the Add button`} color="blue" />
                  : filteredModels
                    ? <div className="p-2.5 space-y-1">
                        {filteredModels.length === 0
                          ? <EmptyState icon={Search} title="No match" subtitle="Try a different search" color="slate" />
                          : filteredModels.map(m => <ModelRow key={m._id} model={m} selected={selectedModel}
                              onSelect={m => setSelectedModel(p => p?._id === m._id ? null : m)}
                              onEdit={m => setModelModal({ open: true, model: m })}
                              onToggle={handleToggleModel} onDelete={handleDeleteModel} />)}
                      </div>
                    : <div className="p-2.5 space-y-3">
                        {groupedModels.map(([series, sModels]) => (
                          <SeriesGroup key={series} series={series} models={sModels} selectedModel={selectedModel}
                            onSelect={m => setSelectedModel(p => p?._id === m._id ? null : m)}
                            onEdit={m => setModelModal({ open: true, model: m })}
                            onToggle={handleToggleModel} onDelete={handleDeleteModel} />
                        ))}
                      </div>
            }
          </div>
        </div>

        {/* ── SERVICES ── */}
        <div className={`bg-white/80 backdrop-blur border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-200 ${selectedModel ? "border-green-200 ring-2 ring-green-100/80" : "border-slate-200"}`}>
          <PanelHeader icon={Wrench} color="green"
            title="Services" count={selectedModel ? `${services.length} for ${selectedModel.name}` : "Select a model"}
            onAdd={() => { if (!selectedModel) return toast.error("Select a model first"); setServiceModal({ open: true, service: null }); }} />
          <div className="px-3 py-2.5 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
            <SearchBox value={serviceSearch} onChange={setServiceSearch} placeholder={selectedModel ? "Search services…" : "Select a model first"} disabled={!selectedModel} color="green" />
          </div>

          {/* Unpriced warning banner */}
          {selectedModel && unpricedServices > 0 && (
            <div className="mx-3 mt-2.5 flex-shrink-0 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-700 font-medium">
                {unpricedServices} service{unpricedServices > 1 ? "s" : ""} using fallback catalog price. Set pricing in the <strong>Pricing</strong> page.
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {!selectedModel
              ? <EmptyState icon={ChevronRight} title="No model selected" subtitle="Click any model to view its repair services" color="slate" />
              : serviceLoading ? <SkeletonList rows={4} />
                : filteredServices.length === 0
                  ? <EmptyState icon={Wrench} title="No services yet" subtitle={`Add repair services for ${selectedModel.name}`} color="green" />
                  : (
                    <div className="p-2.5 space-y-1.5">
                      {filteredServices.map(svc => (
                        <div key={svc._id}
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-150 group">
                          <Avatar src={svc.image} alt={svc.name} icon={Wrench} accent={{ light: "bg-green-50", text: "text-green-400" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{svc.name}</p>
                            {svc.description && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{svc.description}</p>}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <ServicePriceBadge service={svc} />
                              {svc.estimatedTime && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  <Clock className="w-2.5 h-2.5" />{svc.estimatedTime}
                                </span>
                              )}
                              <StatusPill status={svc.status} />
                            </div>
                          </div>
                          <RowActions status={svc.status} onToggle={() => handleToggleService(svc)}
                            onEdit={() => setServiceModal({ open: true, service: svc })} onDelete={() => handleDeleteService(svc)} />
                        </div>
                      ))}
                    </div>
                  )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <BrandModal open={brandModal.open} brand={brandModal.brand}
        onClose={() => setBrandModal({ open: false, brand: null })} onSuccess={loadBrands} />
      <ModelModal open={modelModal.open} model={modelModal.model}
        brandId={selectedBrand?._id} brandName={selectedBrand?.name}
        onClose={() => setModelModal({ open: false, model: null })} onSuccess={loadModels} />
      <ServiceModal open={serviceModal.open} service={serviceModal.service}
        modelId={selectedModel?._id} modelName={selectedModel?.name}
        onClose={() => setServiceModal({ open: false, service: null })} onSuccess={loadServices} />
    </div>
  );
}