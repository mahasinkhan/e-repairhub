import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const api = axios.create({ baseURL: `${BASE}/catalog` });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Brands ───────────────────────────────────────────────────────────────────
export const getBrands          = (params = {})       => api.get("/brands",        { params }).then(r => r.data);
export const createBrand        = (data)              => api.post("/brands",        data).then(r => r.data);
export const updateBrand        = (id, data)          => api.put(`/brands/${id}`,   data).then(r => r.data);
export const deleteBrand        = (id)                => api.delete(`/brands/${id}`).then(r => r.data);
export const toggleBrandStatus  = (id)                => api.patch(`/brands/${id}/toggle-status`).then(r => r.data);

// ─── Series ───────────────────────────────────────────────────────────────────
export const getSeriesByBrand   = (brandId)           => api.get("/series", { params: { brand: brandId } }).then(r => r.data);
export const createSeries       = (data)              => api.post("/series",        data).then(r => r.data);
export const updateSeries       = (id, data)          => api.put(`/series/${id}`,   data).then(r => r.data);
export const deleteSeries       = (id)                => api.delete(`/series/${id}`).then(r => r.data);
export const toggleSeriesStatus = (id)                => api.patch(`/series/${id}/toggle-status`).then(r => r.data);

// ─── Models ───────────────────────────────────────────────────────────────────
export const getModels          = (params = {})       => api.get("/models",         { params }).then(r => r.data);
export const createModel        = (data)              => api.post("/models",         data).then(r => r.data);
export const updateModel        = (id, data)          => api.put(`/models/${id}`,    data).then(r => r.data);
export const deleteModel        = (id)                => api.delete(`/models/${id}`).then(r => r.data);
export const toggleModelStatus  = (id)                => api.patch(`/models/${id}/toggle-status`).then(r => r.data);

// ─── Services ─────────────────────────────────────────────────────────────────
export const getServices        = (params = {})       => api.get("/services",       { params }).then(r => r.data);
export const createService      = (data)              => api.post("/services",       data).then(r => r.data);
export const updateService      = (id, data)          => api.put(`/services/${id}`,  data).then(r => r.data);
export const deleteService      = (id)                => api.delete(`/services/${id}`).then(r => r.data);
export const toggleServiceStatus = (id)               => api.patch(`/services/${id}/toggle-status`).then(r => r.data);

// ─── Variants ─────────────────────────────────────────────────────────────────
export const getVariants        = (params = {})       => api.get("/variants",       { params }).then(r => r.data);
export const createVariant      = (data)              => api.post("/variants",       data).then(r => r.data);
export const updateVariant      = (id, data)          => api.put(`/variants/${id}`,  data).then(r => r.data);
export const deleteVariant      = (id)                => api.delete(`/variants/${id}`).then(r => r.data);
export const toggleVariantStatus = (id)               => api.patch(`/variants/${id}/toggle-status`).then(r => r.data);

// ─── Pricing ─────────────────────────────────────────────────────────────────
export const getPricing         = (params = {})       => api.get("/pricing",        { params }).then(r => r.data);
export const createPricing      = (data)              => api.post("/pricing",        data).then(r => r.data);
export const updatePricing      = (id, data)          => api.put(`/pricing/${id}`,   data).then(r => r.data);
export const deletePricing      = (id)                => api.delete(`/pricing/${id}`).then(r => r.data);