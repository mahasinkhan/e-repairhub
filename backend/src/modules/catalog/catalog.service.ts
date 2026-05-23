import Brand from './brand.model.js';
import Model from './model.model.js';
import Service from './service.model.js';

export const createBrand = async (data: { name: string; description?: string }) => {
  return await Brand.create(data);
};

export const getBrands = async () => {
  return await Brand.find();
};

export const updateBrand = async (id: string, data: any) => {
  return await Brand.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBrand = async (id: string) => {
  return await Brand.findByIdAndDelete(id);
};

export const createModel = async (data: { name: string; brand: string; description?: string }) => {
  return await Model.create(data);
};

export const getModels = async (brandId?: string) => {
  if (brandId) return await Model.find({ brand: brandId }).populate('brand');
  return await Model.find().populate('brand');
};

export const updateModel = async (id: string, data: any) => {
  return await Model.findByIdAndUpdate(id, data, { new: true });
};

export const deleteModel = async (id: string) => {
  return await Model.findByIdAndDelete(id);
};

export const createService = async (data: { name: string; description?: string; price: number; model: string }) => {
  return await Service.create(data);
};

export const getServices = async (modelId?: string) => {
  if (modelId) return await Service.find({ model: modelId }).populate('model');
  return await Service.find().populate('model');
};

export const updateService = async (id: string, data: any) => {
  return await Service.findByIdAndUpdate(id, data, { new: true });
};

export const deleteService = async (id: string) => {
  return await Service.findByIdAndDelete(id);
};
