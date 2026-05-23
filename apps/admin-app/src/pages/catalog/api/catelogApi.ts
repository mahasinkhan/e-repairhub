import axios from "axios";

const catalogApi = axios.create({
  baseURL: "http://localhost:5000/api/catalog", // apna backend URL
  withCredentials: true,
});

// ---------- Brand ----------
export const getBrands = (params?: any) =>
  catalogApi.get("/brands", { params });

export const createBrand = (data: FormData) =>
  catalogApi.post("/brands", data);

export const updateBrand = (
  id: string,
  data: FormData
) => catalogApi.put(`/brands/${id}`, data);

export const deleteBrand = (id: string) =>
  catalogApi.delete(`/brands/${id}`);

export const toggleBrandStatus = (id: string) =>
  catalogApi.patch(`/brands/${id}/toggle-status`);

// ---------- Model ----------
export const getModels = (params?: any) =>
  catalogApi.get("/models", { params });

export const createModel = (data: FormData) =>
  catalogApi.post("/models", data);

export const updateModel = (
  id: string,
  data: FormData
) => catalogApi.put(`/models/${id}`, data);

export const deleteModel = (id: string) =>
  catalogApi.delete(`/models/${id}`);

export const toggleModelStatus = (id: string) =>
  catalogApi.patch(`/models/${id}/toggle-status`);

// ---------- Service ----------
export const getServices = (params?: any) =>
  catalogApi.get("/services", { params });

export const createService = (data: FormData) =>
  catalogApi.post("/services", data);

export const updateService = (
  id: string,
  data: FormData
) => catalogApi.put(`/services/${id}`, data);

export const deleteService = (id: string) =>
  catalogApi.delete(`/services/${id}`);

export const toggleServiceStatus = (id: string) =>
  catalogApi.patch(`/services/${id}/toggle-status`);

// ---------- Variant ----------
export const getVariants = (params?: any) =>
  catalogApi.get("/variants", { params });

export const createVariant = (data: FormData) =>
  catalogApi.post("/variants", data);

export const updateVariant = (
  id: string,
  data: FormData
) => catalogApi.put(`/variants/${id}`, data);

export const deleteVariant = (id: string) =>
  catalogApi.delete(`/variants/${id}`);

export const toggleVariantStatus = (id: string) =>
  catalogApi.patch(`/variants/${id}/toggle-status`);

// ---------- Pricing ----------
export const getPricing = (params?: any) =>
  catalogApi.get("/pricing", { params });

export const createPricing = (data: any) =>
  catalogApi.post("/pricing", data);

export const updatePricing = (
  id: string,
  data: any
) => catalogApi.put(`/pricing/${id}`, data);

export const deletePricing = (id: string) =>
  catalogApi.delete(`/pricing/${id}`);

// ---------- Device Images ----------
export const getDeviceImages = () =>
  catalogApi.get("/device-images");

export const createDeviceImage = (data: FormData) =>
  catalogApi.post("/device-images", data);

export const deleteDeviceImage = (id: string) =>
  catalogApi.delete(`/device-images/${id}`);

export default catalogApi;