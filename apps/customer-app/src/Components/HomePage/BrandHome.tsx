import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { findServiceById } from "../../data/repairFlowData";

const brandsData = [
  {
    name: "Apple",
    category: "iOS",
    popular: true,
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  {
    name: "Samsung",
    category: "Android",
    popular: true,
    image: "https://i.etsystatic.com/23961018/r/il/407d7e/4422996562/il_fullxfull.4422996562_7y6q.jpg",
  },
  {
    name: "OnePlus",
    category: "Android",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSZoyUwHYDxCMefAQCTbxCg0pWpAzIqsvvJ_gJlejdfrEz49ull8ZlNXsILscJz1NmDHRN_Kps-xm2SgQ0Suj5LxvQEyPzQa8zDlvA0lbKSvn2RexGaiKozfl4",
  },
  {
    name: "Xiaomi",
    category: "Android",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRZYTDa_u-TwBB7T0B8VwXZDMXb2Qa0Gf6jp4eyYOqP8NcYRQUUxkAt3makbxgCPdKAUphs_DdWaoA2JXpkAatRMAo9GoHCg9kBYpyGfLQtfa-VZLOn1QQksg",
  },
  {
    name: "Realme",
    category: "Android",
    image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTJl9yVmDltzZZUITp0ouV5dr1JnFWSiiHJ7k8N1uaBtLcnrYzyq56bRlQc4Gl842cDAT0SAVdExHAfKOLUNEcXAqhEjNKZo5gz8sq_QxPJpSE9V0DTA3TT",
  },
  {
    name: "Vivo",
    category: "Android",
    image: "https://sell.gameloot.in/wp-content/uploads/sites/4/2024/10/Vivo-v30e-8GB-RAM-128GB-Storage-Velvet-Red.jpg",
  },
  {
    name: "Oppo",
    category: "Android",
    image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTP8fqsc2JhpQ8_KYKqLvgrq6ahq7TmGL3TtLMq040NMKanOrXAaZrdP5MHTzOIGuPPi37ps8SS2Bd_WGgb7PaCBdwtjYGfMQ",
  },
  {
    name: "Google",
    category: "Android",
    popular: true,
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    name: "Nothing",
    category: "Android",
    image: "https://s3bg.cashify.in/gpro/uploads/2023/12/05211705/nothing-phone-2a-back.webp",
  },
  {
    name: "Motorola",
    category: "Android",
    image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTkrH4IC3fhdE9HmQkagfBvp1d2VBvNMFkNKepdeV3PWHrlIoYtYBV2msjkO9YTxTFaHb5lgrE3vlxsIwdbv5ydnDE-kEY2ps1ZRndj8yY",
  },
  {
    name: "Nokia",
    category: "Budget",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRmjv-TOHHv-_yprc1SsXVu3IGLnq4hN49JI2MSZA2zm9khvwrS8h-U52gt6qZU7LJkBBoTgSUDy-B2WzBe7cvSAjVY910_IOOcG2Y-dey6QoEcAvcuXyesSg",
  },
  {
    name: "iQOO",
    category: "Android",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRFS22uAprSsr4etkHqm5HDsdZ5g2U7SLHAm7ZA0HkLXQbR0WeX0IL1UJ1SHt1R1RPtJuwRxw5-Vdknr9c26VvhHKyVpdWo13aXQ3fHQA",
  },


    {
    name: "Apple",
    category: "iOS",
    popular: true,
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  {
    name: "Samsung",
    category: "Android",
    popular: true,
    image: "https://i.etsystatic.com/23961018/r/il/407d7e/4422996562/il_fullxfull.4422996562_7y6q.jpg",
  },
  {
    name: "OnePlus",
    category: "Android",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSZoyUwHYDxCMefAQCTbxCg0pWpAzIqsvvJ_gJlejdfrEz49ull8ZlNXsILscJz1NmDHRN_Kps-xm2SgQ0Suj5LxvQEyPzQa8zDlvA0lbKSvn2RexGaiKozfl4",
  },
  {
    name: "Xiaomi",
    category: "Android",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRZYTDa_u-TwBB7T0B8VwXZDMXb2Qa0Gf6jp4eyYOqP8NcYRQUUxkAt3makbxgCPdKAUphs_DdWaoA2JXpkAatRMAo9GoHCg9kBYpyGfLQtfa-VZLOn1QQksg",
  },
  {
    name: "Realme",
    category: "Android",
    image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTJl9yVmDltzZZUITp0ouV5dr1JnFWSiiHJ7k8N1uaBtLcnrYzyq56bRlQc4Gl842cDAT0SAVdExHAfKOLUNEcXAqhEjNKZo5gz8sq_QxPJpSE9V0DTA3TT",
  },
  {
    name: "Vivo",
    category: "Android",
    image: "https://sell.gameloot.in/wp-content/uploads/sites/4/2024/10/Vivo-v30e-8GB-RAM-128GB-Storage-Velvet-Red.jpg",
  },
  {
    name: "Oppo",
    category: "Android",
    image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTP8fqsc2JhpQ8_KYKqLvgrq6ahq7TmGL3TtLMq040NMKanOrXAaZrdP5MHTzOIGuPPi37ps8SS2Bd_WGgb7PaCBdwtjYGfMQ",
  },
  {
    name: "Google",
    category: "Android",
    popular: true,
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    name: "Nothing",
    category: "Android",
    image: "https://s3bg.cashify.in/gpro/uploads/2023/12/05211705/nothing-phone-2a-back.webp",
  },
  {
    name: "Motorola",
    category: "Android",
    image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTkrH4IC3fhdE9HmQkagfBvp1d2VBvNMFkNKepdeV3PWHrlIoYtYBV2msjkO9YTxTFaHb5lgrE3vlxsIwdbv5ydnDE-kEY2ps1ZRndj8yY",
  },
  {
    name: "Nokia",
    category: "Budget",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRmjv-TOHHv-_yprc1SsXVu3IGLnq4hN49JI2MSZA2zm9khvwrS8h-U52gt6qZU7LJkBBoTgSUDy-B2WzBe7cvSAjVY910_IOOcG2Y-dey6QoEcAvcuXyesSg",
  },
  {
    name: "iQOO",
    category: "Android",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRFS22uAprSsr4etkHqm5HDsdZ5g2U7SLHAm7ZA0HkLXQbR0WeX0IL1UJ1SHt1R1RPtJuwRxw5-Vdknr9c26VvhHKyVpdWo13aXQ3fHQA",
  },

    {
    name: "Apple",
    category: "iOS",
    popular: true,
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  {
    name: "Samsung",
    category: "Android",
    popular: true,
    image: "https://i.etsystatic.com/23961018/r/il/407d7e/4422996562/il_fullxfull.4422996562_7y6q.jpg",
  },
  {
    name: "OnePlus",
    category: "Android",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSZoyUwHYDxCMefAQCTbxCg0pWpAzIqsvvJ_gJlejdfrEz49ull8ZlNXsILscJz1NmDHRN_Kps-xm2SgQ0Suj5LxvQEyPzQa8zDlvA0lbKSvn2RexGaiKozfl4",
  },
  {
    name: "Xiaomi",
    category: "Android",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRZYTDa_u-TwBB7T0B8VwXZDMXb2Qa0Gf6jp4eyYOqP8NcYRQUUxkAt3makbxgCPdKAUphs_DdWaoA2JXpkAatRMAo9GoHCg9kBYpyGfLQtfa-VZLOn1QQksg",
  },
  {
    name: "Realme",
    category: "Android",
    image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTJl9yVmDltzZZUITp0ouV5dr1JnFWSiiHJ7k8N1uaBtLcnrYzyq56bRlQc4Gl842cDAT0SAVdExHAfKOLUNEcXAqhEjNKZo5gz8sq_QxPJpSE9V0DTA3TT",
  },
  {
    name: "Vivo",
    category: "Android",
    image: "https://sell.gameloot.in/wp-content/uploads/sites/4/2024/10/Vivo-v30e-8GB-RAM-128GB-Storage-Velvet-Red.jpg",
  },
  {
    name: "Oppo",
    category: "Android",
    image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTP8fqsc2JhpQ8_KYKqLvgrq6ahq7TmGL3TtLMq040NMKanOrXAaZrdP5MHTzOIGuPPi37ps8SS2Bd_WGgb7PaCBdwtjYGfMQ",
  },
  {
    name: "Google",
    category: "Android",
    popular: true,
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    name: "Nothing",
    category: "Android",
    image: "https://s3bg.cashify.in/gpro/uploads/2023/12/05211705/nothing-phone-2a-back.webp",
  },
  {
    name: "Motorola",
    category: "Android",
    image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTkrH4IC3fhdE9HmQkagfBvp1d2VBvNMFkNKepdeV3PWHrlIoYtYBV2msjkO9YTxTFaHb5lgrE3vlxsIwdbv5ydnDE-kEY2ps1ZRndj8yY",
  },
  {
    name: "Nokia",
    category: "Budget",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRmjv-TOHHv-_yprc1SsXVu3IGLnq4hN49JI2MSZA2zm9khvwrS8h-U52gt6qZU7LJkBBoTgSUDy-B2WzBe7cvSAjVY910_IOOcG2Y-dey6QoEcAvcuXyesSg",
  },
  {
    name: "iQOO",
    category: "Android",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRFS22uAprSsr4etkHqm5HDsdZ5g2U7SLHAm7ZA0HkLXQbR0WeX0IL1UJ1SHt1R1RPtJuwRxw5-Vdknr9c26VvhHKyVpdWo13aXQ3fHQA",
  },
];

const filters = ["All", "Android", "iOS", "Budget", "Foldable"];

const BrandSection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("service");
  const selectedService = useMemo(() => findServiceById(serviceId), [serviceId]);

  const [selectedFilter, setSelectedFilter] = useState("All");

  const getCount = (filter: string) => {
    if (filter === "All") return brandsData.length;
    return brandsData.filter((b) => b.category === filter).length;
  };

  const filteredBrands = brandsData.filter((brand) => {
    const matchFilter =
      selectedFilter === "All" || brand.category === selectedFilter;
    return matchFilter;
  });

  const handleBrandPick = (brandName: string) => {
    if (serviceId && selectedService) {
      const params = new URLSearchParams();
      params.set("brand", brandName);
      params.set("service", serviceId);
      navigate(`/model?${params.toString()}`);
      return;
    }
    navigate(`/model?brand=${encodeURIComponent(brandName)}`);
  };

  return (
    <div className="brand-container">
      {selectedService && (
        <div className="brand-service-banner">
          <div className="brand-service-banner__icon">
            <img src={selectedService.image} alt="" draggable={false} />
          </div>
          <div>
            <p className="brand-service-banner__eyebrow">Selected repair</p>
            <h2 className="brand-service-banner__title">{selectedService.name}</h2>
            <p className="brand-service-banner__sub">
              Now choose your phone brand — we&apos;ll show full price on the next screen.
            </p>
          </div>
        </div>
      )}

      <h1 className="title">We Repair All Brands</h1>

      <div className="content">
        <div className="sidebar">
          <p className="filter-title">FILTER BY BRAND</p>

          {filters.map((item, index) => (
            <div
              key={index}
              className={`filter-item ${
                selectedFilter === item ? "active" : ""
              }`}
              onClick={() => setSelectedFilter(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedFilter(item);
              }}
              role="button"
              tabIndex={0}
            >
              <span>{item}</span>
              <span className="count">{getCount(item)}</span>
            </div>
          ))}
        </div>

        <div className="brand-grid">
          {filteredBrands.map((brand) => (
            <button
              type="button"
              key={brand.name}
              className="brand-card"
              onClick={() => handleBrandPick(brand.name)}
            >
              {brand.popular && <span className="tag">POPULAR</span>}

              <div className="circle">
                {brand.image ? (
                  <img src={brand.image} alt={brand.name} />
                ) : (
                  <span>{brand.name[0]}</span>
                )}
              </div>

              <p>{brand.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSection;
