import React from "react";
import "./FaqSection.css";
import { FaPlus, FaMinus } from "react-icons/fa";

const faqData = [
  { question: "How long can I stay?", answer: "You can stay as long as your booking allows." },
  { question: "Can I book from this site?", answer: "Yes, you can easily book directly from this site." },
  { question: "Are the prices the same?", answer: "Prices may vary depending on availability." },
  { question: "What's included?", answer: "Basic amenities and services are included." },
  { question: "Need to cancel?", answer: "You can cancel as per our cancellation policy." }
];

const FaqSection = () => {
  return (
    <section id="faq-section" className="faq-section">

      <div className="faq-section__container">

        {/* LEFT SIDE */}
        <div className="faq-section__left">
          <h2 className="faq-section__title">
            Got Questions? We Have Got Answers
          </h2>

          <div className="faq-list">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="faq-item"
              >
                <div className="faq-question">
                  <span>{item.question}</span>
                  <span className="faq-icons" aria-hidden="true">
                    <FaPlus className="faq-ico faq-ico--plus" />
                    <FaMinus className="faq-ico faq-ico--minus" />
                  </span>
                </div>

                <p className="faq-answer">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="faq-section__right">
          <img
            src="https://png.pngtree.com/png-clipart/20240510/original/pngtree-phone-repair-service-pro-png-image_15060154.png"
            alt="faq"
          />
        </div>

      </div>
    </section>
  );
};

export default FaqSection;