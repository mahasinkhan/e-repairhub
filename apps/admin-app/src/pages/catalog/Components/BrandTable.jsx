import { useEffect, useState } from "react";

import {
  getBrands,
  createBrand
} from "../api/catelogApi";

import BrandModal from "./BrandModal";

export default function BrandTable() {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] =
    useState(false);

  const fetchBrands = async () => {
    const res = await getBrands();
    setBrands(res.data.data || res.data);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = async (
    formData
  ) => {
    await createBrand(formData);

    setShowModal(false);

    fetchBrands();
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold">
          Brands
        </h2>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="bg-blue-600 text-white px-4 py-2"
        >
          Add Brand
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {brands.map((brand) => (
            <tr key={brand._id}>
              <td>{brand.name}</td>

              <td>
                {brand.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <BrandModal
          onSave={handleCreate}
          onClose={() =>
            setShowModal(false)
          }
        />
      )}
    </>
  );
}