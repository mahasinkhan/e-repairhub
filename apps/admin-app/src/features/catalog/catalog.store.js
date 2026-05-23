import { useState, useEffect } from 'react';
import * as api from './catalog.api';

export function useBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.fetchBrands().then(r => setBrands(r.data)).finally(() => setLoading(false));
  }, []);
  return { brands, loading };
}

export function useModels(brandId) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!brandId) return;
    api.fetchModels(brandId).then(r => setModels(r.data)).finally(() => setLoading(false));
  }, [brandId]);
  return { models, loading };
}

export function useServices(modelId) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!modelId) return;
    api.fetchServices(modelId).then(r => setServices(r.data)).finally(() => setLoading(false));
  }, [modelId]);
  return { services, loading };
}
