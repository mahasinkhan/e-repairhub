import { Request, Response } from 'express';
import Model from './model.model.js';
import Service from './service.model.js';
import Variant from './variant.model.js';
import DeviceImage from './deviceImage.model.js';
import Pricing from './pricing.model.js';
import Brand from './brand.model.js';
import Series from './series.model.js';

// â”€â”€â”€ BRAND â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body;
    const image = req.file ? `/uploads/brands/${req.file.filename}` : undefined;
    const brand = await Brand.create({ name, description, status, image });
    res.status(201).json(brand);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getBrands = async (req: Request, res: Response) => {
  try {
    const { search = '', status, page = 1, limit = 100 } = req.query;
    const query: any = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    const brands = await Brand.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });
    const total = await Brand.countDocuments(query);
    res.json({ data: brands, total });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body;
    const image = req.file ? `/uploads/brands/${req.file.filename}` : undefined;
    const update: any = { name, description, status };
    if (image) update.image = image;
    const brand = await Brand.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    // Cascade: find all models for this brand, delete their services, then delete models
    const brandModels = await Model.find({ brand: req.params.id });
    const modelIds = brandModels.map(m => m._id);
    if (modelIds.length > 0) {
      await Service.deleteMany({ model: { $in: modelIds } });
      await Model.deleteMany({ brand: req.params.id });
    }

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleBrandStatus = async (req: Request, res: Response) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    brand.status = brand.status === 'active' ? 'inactive' : 'active';
    await brand.save();
    res.json(brand);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// â”€â”€â”€ MODEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createModel = async (req: Request, res: Response) => {
  try {
    const { name, brand, deviceType, series, status, colors } = req.body;
    const image = req.file ? `/uploads/models/${req.file.filename}` : undefined;
    const parsedColors = typeof colors === "string" ? JSON.parse(colors || "[]") : (colors ?? []);
    const model = await Model.create({ name, brand, deviceType, series: series?.trim() ?? '', status, image, colors: parsedColors });
    res.status(201).json(model);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getModels = async (req: Request, res: Response) => {
  try {
    const { search = '', brand, status, page = 1, limit = 200 } = req.query;
    const query: any = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (brand) query.brand = brand;
    if (status) query.status = status;
    const models = await Model.find(query)
      .populate('brand')
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ series: 1, name: 1 });           // sort by series then name
    const total = await Model.countDocuments(query);
    res.json({ data: models, total });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateModel = async (req: Request, res: Response) => {
  try {
    const { name, brand, deviceType, series, status, colors } = req.body;
    const image = req.file ? `/uploads/models/${req.file.filename}` : undefined;
    const update: any = { name, brand, deviceType, series: series?.trim() ?? '', status };
    if (colors !== undefined) update.colors = typeof colors === "string" ? JSON.parse(colors || "[]") : colors;
    if (image) update.image = image;
    const model = await Model.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!model) return res.status(404).json({ message: 'Model not found' });
    res.json(model);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteModel = async (req: Request, res: Response) => {
  try {
    const model = await Model.findByIdAndDelete(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model not found' });
    // Cascade: delete all services for this model
    await Service.deleteMany({ model: req.params.id });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleModelStatus = async (req: Request, res: Response) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model not found' });
    model.status = model.status === 'active' ? 'inactive' : 'active';
    await model.save();
    res.json(model);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// â”€â”€â”€ SERVICE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, estimatedTime, price, status, model } = req.body;
    const image = req.file ? `/uploads/services/${req.file.filename}` : undefined;
    const service = await Service.create({ name, description, estimatedTime, price: +price, status, model, image });
    res.status(201).json(service);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const { search = '', model, status, page = 1, limit = 200 } = req.query;
    const query: any = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (model)  query.model = model;
    if (status) query.status = status;

    const services = await Service.find(query)
      .populate('model')
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ name: 1 });

    const total = await Service.countDocuments(query);

    // â”€â”€ Join Pricing data for each service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const serviceIds  = services.map(s => s._id);
    const modelId     = model ? model : undefined;

    // Build query for pricing â€” if model is specified, match both
    const pricingQuery: any = { service: { $in: serviceIds } };
    if (modelId) pricingQuery.model = modelId;

    const pricingRecords = await Pricing.find(pricingQuery).lean();

    // Map pricing by serviceId (use modelId+serviceId key when multiple models)
    const pricingMap = new Map<string, any>();
    for (const p of pricingRecords) {
      const key = modelId
        ? String(p.service)
        : `${String(p.model)}_${String(p.service)}`;
      pricingMap.set(key, p);
    }

    // Attach pricing to each service
    const enriched = services.map(svc => {
      const plain = svc.toObject();
      const key   = modelId
        ? String(svc._id)
        : `${String((plain.model as any)?._id ?? plain.model)}_${String(svc._id)}`;
      const pricing = pricingMap.get(key) ?? null;
      return {
        ...plain,
        // pricing-aware price: use finalPrice from Pricing if set, else fall back to service.price
        price:   pricing?.finalPrice ?? plain.price ?? 0,
        pricing: pricing ?? null,
      };
    });

    res.json({ data: enriched, total });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { name, description, estimatedTime, price, status, model } = req.body;
    const image = req.file ? `/uploads/services/${req.file.filename}` : undefined;
    const update: any = { name, description, estimatedTime, price: +price, status, model };
    if (image) update.image = image;
    const service = await Service.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleServiceStatus = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    service.status = service.status === 'active' ? 'inactive' : 'active';
    await service.save();
    res.json(service);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// â”€â”€â”€ VARIANT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createVariant = async (req: Request, res: Response) => {
  try {
    const { name, colorCode, model } = req.body;
    const image = req.file ? `/uploads/variants/${req.file.filename}` : undefined;
    const variant = await Variant.create({ name, colorCode, model, image });
    res.status(201).json(variant);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getVariants = async (req: Request, res: Response) => {
  try {
    const { search = '', model, page = 1, limit = 50 } = req.query;
    const query: any = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (model) query.model = model;
    const variants = await Variant.find(query).populate('model').skip((+page - 1) * +limit).limit(+limit).sort({ createdAt: -1 });
    const total = await Variant.countDocuments(query);
    res.json({ data: variants, total });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { name, colorCode, model } = req.body;
    const image = req.file ? `/uploads/variants/${req.file.filename}` : undefined;
    const update: any = { name, colorCode, model };
    if (image) update.image = image;
    const variant = await Variant.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(variant);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteVariant = async (req: Request, res: Response) => {
  try {
    await Variant.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleVariantStatus = async (req: Request, res: Response) => {
  try {
    const variant = await Variant.findById(req.params.id);
    if (!variant) return res.status(404).json({ message: 'Variant not found' });
    variant.status = variant.status === 'active' ? 'inactive' : 'active';
    await variant.save();
    res.json(variant);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// â”€â”€â”€ DEVICE IMAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createDeviceImage = async (req: Request, res: Response) => {
  try {
    const { model, variant } = req.body;
    const url = req.file ? `/uploads/device-images/${req.file.filename}` : undefined;
    const deviceImage = await DeviceImage.create({ model, variant, url });
    res.status(201).json(deviceImage);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getDeviceImages = async (req: Request, res: Response) => {
  try {
    const { model, variant, page = 1, limit = 50 } = req.query;
    const query: any = {};
    if (model) query.model = model;
    if (variant) query.variant = variant;
    const images = await DeviceImage.find(query).populate('model variant').skip((+page - 1) * +limit).limit(+limit).sort({ createdAt: -1 });
    const total = await DeviceImage.countDocuments(query);
    res.json({ data: images, total });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteDeviceImage = async (req: Request, res: Response) => {
  try {
    await DeviceImage.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// â”€â”€â”€ PRICING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createPricing = async (req: Request, res: Response) => {
  try {
    const { model, service, basePrice, pickupCharge = 0, urgentCharge = 0, discount = 0 } = req.body;
    const finalPrice = +basePrice + +pickupCharge + +urgentCharge - +discount;
    const pricing = await Pricing.create({ model, service, basePrice: +basePrice, pickupCharge: +pickupCharge, urgentCharge: +urgentCharge, discount: +discount, finalPrice });
    res.status(201).json(pricing);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getPricing = async (req: Request, res: Response) => {
  try {
    const { model, service, page = 1, limit = 50 } = req.query;
    const query: any = {};
    if (model) query.model = model;
    if (service) query.service = service;
    const pricing = await Pricing.find(query).populate('model service').skip((+page - 1) * +limit).limit(+limit).sort({ createdAt: -1 });
    const total = await Pricing.countDocuments(query);
    res.json({ data: pricing, total });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePricing = async (req: Request, res: Response) => {
  try {
    const { basePrice, pickupCharge = 0, urgentCharge = 0, discount = 0 } = req.body;
    const finalPrice = +basePrice + +pickupCharge + +urgentCharge - +discount;
    const pricing = await Pricing.findByIdAndUpdate(req.params.id,
      { basePrice: +basePrice, pickupCharge: +pickupCharge, urgentCharge: +urgentCharge, discount: +discount, finalPrice },
      { new: true });
    res.json(pricing);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePricing = async (req: Request, res: Response) => {
  try {
    await Pricing.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// â”€â”€â”€ SERIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createSeries = async (req: Request, res: Response) => {
  try {
    const { name, brand, status } = req.body;
    const series = await Series.create({ name, brand, status });
    res.status(201).json(series);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getSeriesByBrand = async (req: Request, res: Response) => {
  try {
    const { brand, status, page = 1, limit = 100 } = req.query;
    const query: any = {};
    if (brand) query.brand = brand;
    if (status) query.status = status;
    const series = await Series.find(query)
      .populate('brand')
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ name: 1 });
    const total = await Series.countDocuments(query);
    res.json({ data: series, total });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSeries = async (req: Request, res: Response) => {
  try {
    const { name, brand, status } = req.body;
    const series = await Series.findByIdAndUpdate(
      req.params.id,
      { name, brand, status },
      { new: true }
    );
    if (!series) return res.status(404).json({ message: 'Series not found' });
    res.json(series);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteSeries = async (req: Request, res: Response) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) return res.status(404).json({ message: 'Series not found' });
    await Model.updateMany({ series: req.params.id }, { $unset: { series: '' } });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleSeriesStatus = async (req: Request, res: Response) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ message: 'Series not found' });
    series.status = series.status === 'active' ? 'inactive' : 'active';
    await series.save();
    res.json(series);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
