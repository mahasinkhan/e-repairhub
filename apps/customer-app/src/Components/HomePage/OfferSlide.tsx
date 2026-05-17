import React, { useEffect, useState } from "react";
import "./OfferSlide.css";

const slides = [
  {
    title: "Price Crash Zone",
    subtitle: "Get the devices you want at lowest-ever prices",
    badge: "Limited Time",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE6ZxB9-jiRJMtDyzZcq_Dyulc348Vscg4Bg&s",
  },
  {
    title: "Mega Repair Sale",
    subtitle: "Flat 40% OFF on mobile repairs",
    badge: "Hot Deal",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdje80xqeeSM8zSbOgAsFP3vdFq2REL5J7vg&s",
  },
  {
    title: "Fast Pickup Service",
    subtitle: "Doorstep pickup in 30 minutes",
    badge: "New",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXUVXERm3yWgAa9s5uAIG2et2PtD1mM-1n6g&s",
  },
];

const OfferSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="slider-outer">
      <div className="slider">

        <div
          className="slider-wrapper"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div className="slide" key={index}>

              {/* IMAGE LEFT - full height */}
              <div className="slide-image">
                <img src={slide.image} alt={slide.title} />
              </div>

              {/* CONTENT RIGHT */}
              <div className="slide-content">
                <span className="slide-badge">{slide.badge}</span>
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
                <button className="slide-btn">Order Now →</button>
              </div>

            </div>
          ))}
        </div>

        {/* ARROWS */}
        <button className="arrow left" onClick={prevSlide}>❮</button>
        <button className="arrow right" onClick={nextSlide}>❯</button>

      </div>

      {/* DOTS */}
      <div className="dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={current === index ? "dot active" : "dot"}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default OfferSlider;