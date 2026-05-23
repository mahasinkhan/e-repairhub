import { Request, Response } from 'express';
import Model from './model.model.js';
import Service from './service.model.js';
import Variant from './variant.model.js';
import DeviceImage from './deviceImage.model.js';
import Pricing from './pricing.model.js';
import Brand from './brand.model.js';

// Create Model
export const createModel = async (req: Request, res: Response) => {
  const { name, brand, deviceType, status } = req.body;
  const image = req.file ? `/uploads/models/${req.file.filename}` : undefined;
  const model = await Model.create({ name, brand, deviceType, status, image });
  res.status(201).json(model);
};

// Get Models with search, filter, pagination
export const getModels = async (req: Request, res: Response) => {
  const { search = '', brand, status, page = 1, limit = 10 } = req.query;
  const query: any = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (brand) query.brand = brand;
  if (status) query.status = status;
  const models = await Model.find(query)
    .populate('brand')
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .sort({ createdAt: -1 });
  const total = await Model.countDocuments(query);
  res.json({ data: models, total });
};

// Update Model
export const updateModel = async (req: Request, res: Response) => {
  const { name, brand, deviceType, status } = req.body;
  const image = req.file ? `/uploads/models/${req.file.filename}` : undefined;
  const update: any = { name, brand, deviceType, status };
  if (image) update.image = image;
  const model = await Model.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(model);
};

// Delete Model
export const deleteModel = async (req: Request, res: Response) => {
  await Model.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

// Toggle Model Status
export const toggleModelStatus = async (req: Request, res: Response) => {
  const model = await Model.findById(req.params.id);
  if (!model) return res.status(404).json({ message: 'Model not found' });
  model.status = model.status === 'active' ? 'inactive' : 'active';
  await model.save();
  res.json(model);
};

// Create Service
export const createService = async (req: Request, res: Response) => {
  const { name, description, estimatedTime, price, status, model } = req.body;
  const image = req.file ? `/uploads/services/${req.file.filename}` : undefined;
  const service = await Service.create({ name, description, estimatedTime, price, status, model, image });
  res.status(201).json(service);
};

// Get Services with search, filter, pagination
export const getServices = async (req: Request, res: Response) => {
  const { search = '', model, status, page = 1, limit = 10 } = req.query;
  const query: any = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (model) query.model = model;
  if (status) query.status = status;
  const services = await Service.find(query)
    .populate('model')
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .sort({ createdAt: -1 });
  const total = await Service.countDocuments(query);
  res.json({ data: services, total });
};

// Update Service
export const updateService = async (req: Request, res: Response) => {
  const { name, description, estimatedTime, price, status, model } = req.body;
  const image = req.file ? `/uploads/services/${req.file.filename}` : undefined;
  const update: any = { name, description, estimatedTime, price, status, model };
  if (image) update.image = image;
  const service = await Service.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(service);
};

// Delete Service
export const deleteService = async (req: Request, res: Response) => {
  await Service.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

// Toggle Service Status
export const toggleServiceStatus = async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  service.status = service.status === 'active' ? 'inactive' : 'active';
  await service.save();
  res.json(service);
};

// Create Variant
export const createVariant = async (req: Request, res: Response) => {
  const { name, colorCode, model } = req.body;
  const image = req.file ? `/uploads/variants/${req.file.filename}` : undefined;
  const variant = await Variant.create({ name, colorCode, model, image });
  res.status(201).json(variant);
};

// Get Variants with search, filter, pagination
export const getVariants = async (req: Request, res: Response) => {
  const { search = '', model, page = 1, limit = 10 } = req.query;
  const query: any = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (model) query.model = model;
  const variants = await Variant.find(query)
    .populate('model')
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .sort({ createdAt: -1 });
  const total = await Variant.countDocuments(query);
  res.json({ data: variants, total });
};

// Update Variant
export const updateVariant = async (req: Request, res: Response) => {
  const { name, colorCode, model } = req.body;
  const image = req.file ? `/uploads/variants/${req.file.filename}` : undefined;
  const update: any = { name, colorCode, model };
  if (image) update.image = image;
  const variant = await Variant.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(variant);
};

// Delete Variant
export const deleteVariant = async (req: Request, res: Response) => {
  await Variant.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

// Create Device Image
export const createDeviceImage = async (req: Request, res: Response) => {
  const { model, variant } = req.body;
  const url = req.file ? `/uploads/device-images/${req.file.filename}` : undefined;
  const deviceImage = await DeviceImage.create({ model, variant, url });
  res.status(201).json(deviceImage);
};

// Get Device Images with filter, pagination
export const getDeviceImages = async (req: Request, res: Response) => {
  const { model, variant, page = 1, limit = 10 } = req.query;
  const query: any = {};
  if (model) query.model = model;
  if (variant) query.variant = variant;
  const images = await DeviceImage.find(query)
    .populate('model variant')
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .sort({ createdAt: -1 });
  const total = await DeviceImage.countDocuments(query);
  res.json({ data: images, total });
};

// Delete Device Image
export const deleteDeviceImage = async (req: Request, res: Response) => {
  await DeviceImage.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

// Create Pricing
export const createPricing = async (req: Request, res: Response) => {
  const { model, service, basePrice, pickupCharge, urgentCharge, discount } = req.body;
  const finalPrice = basePrice + (pickupCharge || 0) + (urgentCharge || 0) - (discount || 0);
  const pricing = await Pricing.create({ model, service, basePrice, pickupCharge, urgentCharge, discount, finalPrice });
  res.status(201).json(pricing);
};

// Get Pricing with filter, pagination
export const getPricing = async (req: Request, res: Response) => {
  const { model, service, page = 1, limit = 10 } = req.query;
  const query: any = {};
  if (model) query.model = model;
  if (service) query.service = service;
  const pricing = await Pricing.find(query)
    .populate('model service')
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .sort({ createdAt: -1 });
  const total = await Pricing.countDocuments(query);
  res.json({ data: pricing, total });
};

// Update Pricing
export const updatePricing = async (req: Request, res: Response) => {
  const { basePrice, pickupCharge, urgentCharge, discount } = req.body;
  const finalPrice = basePrice + (pickupCharge || 0) + (urgentCharge || 0) - (discount || 0);
  const update: any = { basePrice, pickupCharge, urgentCharge, discount, finalPrice };
  const pricing = await Pricing.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(pricing);
};

// Delete Pricing
export const deletePricing = async (req: Request, res: Response) => {
  await Pricing.findByIdAndDelete(req.params.id);
  res.status(204).send();
};


// Create Brand
export const createBrand = async (req: Request, res: Response) => {
  const { name, description, status } = req.body;
  const image = req.file ? `/uploads/brands/${req.file.filename}` : undefined;
  const brand = await Brand.create({ name, description, status, image });
  res.status(201).json(brand);
};

// Get Brand 
export const getBrands = async (req: Request, res: Response) => {
  const { search = '', status, page = 1, limit = 10 } = req.query;
  const query: any = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    const brands = await Brand.find(query)
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .sort({ createdAt: -1 });
    const total = await Brand.countDocuments(query);
    res.json({ data: brands, total });
}

// update Brand
export const updateBrand = async (req: Request, res: Response) => {
  const { name, description, status } = req.body;
  const image = req.file ? `/uploads/brands/${req.file.filename}` : undefined;
    const update: any = { name, description, status };
    if (image) update.image = image;
    const brand = await Brand.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(brand);
}

// delete Brand
export const deleteBrand = async (req: Request, res: Response) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.status(204).send();
}


// toggle Brand status

export const toggleBrandStatus = async (req: Request, res: Response) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    brand.status = brand.status === 'active' ? 'inactive' : 'active';
    await brand.save();
    res.json(brand);
}

// toogle variant status
export const toggleVariantStatus = async (req: Request, res: Response) => {
    const variant = await Variant.findById(req.params.id);
    if (!variant) return res.status(404).json({ message: 'Variant not found' });
    variant.status = variant.status === 'active' ? 'inactive' : 'active';
    await variant.save();
    res.json(variant);
}
