import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { findBrandByName, findServiceById, getModelRecordsForBrand } from "../data/repairFlowData";
import "./Model.css";

const Model = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const brandName = searchParams.get("brand");
  const serviceId = searchParams.get("service");
  const service = findServiceById(serviceId);
  const brand = findBrandByName(brandName);

  const [search, setSearch] = useState("");
  const [activeModel, setActiveModel] = useState<string>("All Models");
  const filtersRef = useRef<HTMLDivElement | null>(null);

  const modelRecords = useMemo(() => getModelRecordsForBrand(brandName), [brandName]);
  const models = useMemo(() => modelRecords.map((m) => m.name), [modelRecords]);
  const filters = useMemo(() => ["All Models", ...models], [models]);

  const filteredModels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return modelRecords.filter((m) => {
      const filterOk = activeModel === "All Models" || m.name === activeModel;
      const searchOk = !q || m.name.toLowerCase().includes(q);
      return filterOk && searchOk;
    });
  }, [modelRecords, search, activeModel]);

  const goNext = (model: string) => {
    const params = new URLSearchParams();
    if (brandName) params.set("brand", brandName);
    if (serviceId) params.set("service", serviceId);
    params.set("model", model);
    // If service already selected (service-first flow), go directly to pricing (skip color).
    if (serviceId) navigate(`/pricing?${params.toString()}`);
    else navigate(`/service?${params.toString()}`);
  };

  const scrollFiltersBy = (dx: number) => {
    const node = filtersRef.current;
    if (!node) return;
    node.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <div className="modelPage">
      <header className="modelHero">
        {brand && (
          <div className="modelBrandChip">
            <div className="modelBrandChipLogo">
              <img src={brand.image} alt="" draggable={false} />
            </div>
            <p className="modelBrandChipText">
              Selected device: <span className="modelBrandChipName">{brand.name}</span>
            </p>
          </div>
        )}

        <h1 className="modelTitle">Choose Your Phone Model</h1>
        <p className="modelSub">
          {brandName ? `Selected brand: ${decodeURIComponent(brandName)}` : "Select a brand first."}
          {service ? ` · Repair: ${service.name}` : ""}
        </p>
      </header>

      <div className="modelSearch">
        <input
          type="text"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="modelFiltersWrap">
        <button
          type="button"
          className="modelFiltersArrow modelFiltersArrow--left"
          onClick={() => scrollFiltersBy(-280)}
          aria-label="Scroll filters left"
        >
          ‹
        </button>

        <div ref={filtersRef} className="modelFilters" role="tablist" aria-label="Model filters">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={`modelChip${activeModel === f ? " is-on" : ""}`}
              onClick={() => setActiveModel(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="modelFiltersArrow modelFiltersArrow--right"
          onClick={() => scrollFiltersBy(280)}
          aria-label="Scroll filters right"
        >
          ›
        </button>
      </div>

      <div className="modelGrid">
        {filteredModels.map((m) => (
          <button key={m.name} type="button" className="modelCard" onClick={() => goNext(m.name)}>
            <div className="modelCardImgWrap">
              <img src={m.image} alt="" draggable={false} />
            </div>
            <p className="modelCardName">{m.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Model;

