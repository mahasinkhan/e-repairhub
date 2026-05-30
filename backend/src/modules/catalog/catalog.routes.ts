import { Router } from 'express';
import * as catalogController from './catalog.controller.js';
import { uploadBrandImage }   from './brand.model.js';
import { uploadModelImage }   from './model.model.js';
import { uploadServiceImage } from './service.model.js';
import { uploadVariantImage } from './variant.model.js';
import { uploadDeviceImage }  from './deviceImage.model.js';

const router = Router();

// ─── Brand routes ─────────────────────────────────────────────────────────────
router.post  ('/brands',                 uploadBrandImage.single('image'), catalogController.createBrand);
router.get   ('/brands',                                                   catalogController.getBrands);
router.put   ('/brands/:id',             uploadBrandImage.single('image'), catalogController.updateBrand);
router.delete('/brands/:id',                                               catalogController.deleteBrand);
router.patch ('/brands/:id/toggle-status',                                 catalogController.toggleBrandStatus);

// ─── Series routes ────────────────────────────────────────────────────────────
router.post  ('/series',                  catalogController.createSeries);
router.get   ('/series',                  catalogController.getSeriesByBrand);   // ?brand=<id>
router.put   ('/series/:id',              catalogController.updateSeries);
router.delete('/series/:id',              catalogController.deleteSeries);
router.patch ('/series/:id/toggle-status', catalogController.toggleSeriesStatus);

// ─── Model routes ─────────────────────────────────────────────────────────────
router.post  ('/models',                 uploadModelImage.single('image'), catalogController.createModel);
router.get   ('/models',                                                   catalogController.getModels);
router.put   ('/models/:id',             uploadModelImage.single('image'), catalogController.updateModel);
router.delete('/models/:id',                                               catalogController.deleteModel);
router.patch ('/models/:id/toggle-status',                                 catalogController.toggleModelStatus);

// ─── Service routes ───────────────────────────────────────────────────────────
router.post  ('/services',               uploadServiceImage.single('image'), catalogController.createService);
router.get   ('/services',                                                   catalogController.getServices);
router.put   ('/services/:id',           uploadServiceImage.single('image'), catalogController.updateService);
router.delete('/services/:id',                                               catalogController.deleteService);
router.patch ('/services/:id/toggle-status',                                 catalogController.toggleServiceStatus);

// ─── Variant routes ───────────────────────────────────────────────────────────
router.post  ('/variants',               uploadVariantImage.single('image'), catalogController.createVariant);
router.get   ('/variants',                                                   catalogController.getVariants);
router.put   ('/variants/:id',           uploadVariantImage.single('image'), catalogController.updateVariant);
router.delete('/variants/:id',                                               catalogController.deleteVariant);
router.patch ('/variants/:id/toggle-status',                                 catalogController.toggleVariantStatus);

// ─── Device Image routes ──────────────────────────────────────────────────────
router.post  ('/device-images',           uploadDeviceImage.single('image'), catalogController.createDeviceImage);
router.get   ('/device-images',                                              catalogController.getDeviceImages);
router.delete('/device-images/:id',                                          catalogController.deleteDeviceImage);

// ─── Pricing routes ───────────────────────────────────────────────────────────
router.post  ('/pricing',    catalogController.createPricing);
router.get   ('/pricing',    catalogController.getPricing);
router.put   ('/pricing/:id', catalogController.updatePricing);
router.delete('/pricing/:id', catalogController.deletePricing);

export default router;