import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiAlertTriangle, FiCpu, FiGrid, FiCode } from "react-icons/fi";
import {
  REPAIR_SERVICES,
  findBrandByName,
  type RepairServiceRecord,
} from "../../data/repairFlowData";
import "./ServicesName.css";

const filters = ["All", "Hardware", "Software", "Damage"] as const;
const filterIcons: Record<(typeof filters)[number], React.ReactNode> = {
  All: <FiGrid aria-hidden="true" />,
  Hardware: <FiCpu aria-hidden="true" />,
  Software: <FiCode aria-hidden="true" />,
  Damage: <FiAlertTriangle aria-hidden="true" />,
};

const ServiceSection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandParam = searchParams.get("brand");
  const modelParam = searchParams.get("model");
  const selectedBrand = findBrandByName(brandParam);
  const selectedModel = modelParam ? decodeURIComponent(modelParam) : null;

  const [selectedFilter, setSelectedFilter] = useState<(typeof filters)[number]>("All");
  const [search, setSearch] = useState("");

  const getCount = (filter: (typeof filters)[number]) => {
    if (filter === "All") return REPAIR_SERVICES.length;
    return REPAIR_SERVICES.filter((s) => s.type === filter).length;
  };

  const filteredServices = useMemo(() => {
    return REPAIR_SERVICES.filter((service) => {
      const matchFilter =
        selectedFilter === "All" || service.type === selectedFilter;
      const matchSearch = service.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [selectedFilter, search]);

  const handlePickService = (service: RepairServiceRecord) => {
    if (selectedBrand) {
      const params = new URLSearchParams();
      params.set("brand", selectedBrand.name);
      params.set("service", service.id);
      if (modelParam) {
        params.set("model", modelParam);
        navigate(`/pricing?${params.toString()}`);
      } else {
        navigate(`/model?${params.toString()}`);
      }
      return;
    }

    const params = new URLSearchParams();
    params.set("service", service.id);
    if (brandParam) {
      params.set("brand", selectedBrand?.name ?? brandParam);
    }
    navigate(`/pricing?${params.toString()}`);
  };

  return (
    <div className="service-container">
      <header className="service-hero">
        {selectedBrand && (
          <div className="service-hero__brand">
            <div className="service-hero__brandLogo">
              <img src={selectedBrand.image} alt="" draggable={false} />
            </div>
            <p className="service-hero__brandText">
              Selected device: <span className="service-hero__brandName">{selectedBrand.name}</span>
              {selectedModel && (
                <>
                  {" "}
                  · <span className="service-hero__model">{selectedModel}</span>
                </>
              )}
            </p>
          </div>
        )}

        <h1 className="service-title">Choose Your Repair Service</h1>
        <p className="service-hero__sub">
          Search and filter services below final pricing will be shown on the next step.
        </p>

        {!brandParam && (
          <p className="service-hint service-hint--servicePage">
            Tip: open <strong>Services</strong> from the home brand grid to pre-select your phone brand.
          </p>
        )}
      </header>

      <div className="service-search">
        <input
          type="text"
          placeholder="Search services like screen, battery..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="service-content">
        <div className="service-filters">
          <p className="service-filterTitle">FILTER BY SERVICE</p>

          {filters.map((item) => (
            <div
              key={item}
              className={`service-filterItem ${
                selectedFilter === item ? "active" : ""
              }`}
              onClick={() => setSelectedFilter(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedFilter(item);
              }}
              role="button"
              tabIndex={0}
            >
              <span className="service-filterIcon">{filterIcons[item]}</span>
              <span className="service-filterLabel">{item}</span>
              <span className="service-filterCount">{getCount(item)}</span>
            </div>
          ))}
        </div>

        <div className="service-grid">
          {filteredServices.map((service) => (
            <button
              type="button"
              key={service.id}
              className="service-card"
              onClick={() => handlePickService(service)}
            >
              <div className="service-circle">
                <img src={service.image} alt="" />
              </div>
              <p>{service.name}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ServiceSection;
