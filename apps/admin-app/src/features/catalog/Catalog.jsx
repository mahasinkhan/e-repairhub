import React, { useState } from 'react';
import { useBrands, useModels, useServices } from './catalog.store';
import { createBrand, updateBrand, deleteBrand, createModel, updateModel, deleteModel, createService, updateService, deleteService } from './catalog.api';

export default function Catalog() {
  const { brands } = useBrands();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const { models } = useModels(selectedBrand?._id);
  const [selectedModel, setSelectedModel] = useState(null);
  const { services } = useServices(selectedModel?._id);

  // UI for managing brands, models, and services
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Catalog Management</h1>
      <div className="grid grid-cols-3 gap-6">
        {/* Brands */}
        <div>
          <h2 className="font-bold mb-2">Brands</h2>
          <ul>
            {brands.map(b => (
              <li key={b._id} className={`cursor-pointer p-2 rounded ${selectedBrand?._id === b._id ? 'bg-blue-100' : ''}`} onClick={() => setSelectedBrand(b)}>{b.name}</li>
            ))}
          </ul>
          {/* Add/Edit/Delete Brand UI here */}
        </div>
        {/* Models */}
        <div>
          <h2 className="font-bold mb-2">Models</h2>
          <ul>
            {models?.map(m => (
              <li key={m._id} className={`cursor-pointer p-2 rounded ${selectedModel?._id === m._id ? 'bg-green-100' : ''}`} onClick={() => setSelectedModel(m)}>{m.name}</li>
            ))}
          </ul>
          {/* Add/Edit/Delete Model UI here */}
        </div>
        {/* Services */}
        <div>
          <h2 className="font-bold mb-2">Services</h2>
          <ul>
            {services?.map(s => (
              <li key={s._id} className="p-2 border-b">{s.name} - ${s.price}</li>
            ))}
          </ul>
          {/* Add/Edit/Delete Service UI here */}
        </div>
      </div>
    </div>
  );
}
