import axios from 'axios';

const API = axios.create({ baseURL: '/catalog' });

// Brand APIs
export const fetchBrands = () => API.get('/brands');
export const createBrand = (data) => API.post('/brands', data);
export const updateBrand = (id, data) => API.put(`/brands/${id}`, data);
export const deleteBrand = (id) => API.delete(`/brands/${id}`);

// Model APIs
export const fetchModels = (brandId) => API.get('/models', { params: { brandId } });
export const createModel = (data) => API.post('/models', data);
export const updateModel = (id, data) => API.put(`/models/${id}`, data);
export const deleteModel = (id) => API.delete(`/models/${id}`);

// Service APIs
export const fetchServices = (modelId) => API.get('/services', { params: { modelId } });
export const createService = (data) => API.post('/services', data);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);
