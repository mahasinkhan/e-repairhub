// Earnings.jsx

import React, { useState } from "react";
import "./../styles/earnings.css";

const monthlyData = {
  All: {
    totalOrders: 328,
    totalRevenue: "₹4,34,500",
    totalCommission: "₹82,000",
    bars: [90, 130, 110, 160, 200, 170],
  },
  January: {
    totalOrders: 42,
    totalRevenue: "₹48,000",
    totalCommission: "₹9,000",
    bars: [60, 90, 70, 120, 150, 100],
  },
  February: {
    totalOrders: 58,
    totalRevenue: "₹72,000",
    totalCommission: "₹13,500",
    bars: [90, 130, 100, 150, 180, 140],
  },
  March: {
    totalOrders: 76,
    totalRevenue: "₹1,04,000",
    totalCommission: "₹19,000",
    bars: [100, 140, 120, 170, 210, 180],
  },
  April: {
    totalOrders: 63,
    totalRevenue: "₹86,000",
    totalCommission: "₹16,000",
    bars: [80, 120, 110, 160, 190, 150],
  },
  May: {
    totalOrders: 89,
    totalRevenue: "₹1,24,500",
    totalCommission: "₹22,000",
    bars: [110, 150, 130, 190, 230, 200],
  },
};

const BAR_COLORS = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#ca8a04", // yellow
  "#0891b2", // cyan
  "#7c3aed", // violet
];

const WEEK_LABELS = [
  "Week 1",
  "Week 2",
  "Week 3",
  "Week 4",
  "Week 5",
  "Week 6",
];

// --- SVG Icons ---

const OrdersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const RevenueIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);

const CommissionIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

// --- Main Component ---

const Earnings = () => {
  const [selectedMonth, setSelectedMonth] = useState("All");

  const currentData = monthlyData[selectedMonth];

  return (
    <div className="earnings-page">

      {/* FILTERS */}
      <div className="earnings-filters">
        <div className="filter-box">
          <label>Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {Object.keys(monthlyData).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="earnings-cards">

        <div className="earnings-card">
          <div className="card-icon icon-orders">
            <OrdersIcon />
          </div>
          <div className="card-info">
            <h3>Total Orders</h3>
            <h2>{currentData.totalOrders}</h2>
          </div>
        </div>

        <div className="earnings-card">
          <div className="card-icon icon-revenue">
            <RevenueIcon />
          </div>
          <div className="card-info">
            <h3>Total Revenue</h3>
            <h2>{currentData.totalRevenue}</h2>
          </div>
        </div>

        <div className="earnings-card">
          <div className="card-icon icon-commission">
            <CommissionIcon />
          </div>
          <div className="card-info">
            <h3>Total Commission</h3>
            <h2>{currentData.totalCommission}</h2>
          </div>
        </div>

      </div>

      {/* CHART SECTION */}
      <div className="earnings-chart-section">

        <div className="chart-header">
          <h3>Revenue Analytics</h3>
          <p>Monthly repair revenue generated</p>
        </div>

        {/* BARS */}
        <div className="chart-bars">
          {currentData.bars.map((height, index) => (
            <div className="bar-item" key={index}>

              {/* Value + label shown above bar — always visible */}
              <div className="bar-tooltip">
                <span className="tooltip-value">
                  ₹{(height * 500).toLocaleString()}
                </span>
                <span className="tooltip-label">
                  {WEEK_LABELS[index]}
                </span>
              </div>

              <div
                className="bar"
                style={{
                  height: `${height}px`,
                  background: BAR_COLORS[index],
                }}
              ></div>

              <span>W{index + 1}</span>

            </div>
          ))}
        </div>

      </div>

      {/* TABLE SECTION */}
      <div className="earnings-table-wrapper">

        <div className="table-header">
          <h3>Earnings Summary</h3>
          <p>Revenue and orders overview</p>
        </div>

        <table className="earnings-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Orders</th>
              <th>Total Revenue</th>
              <th>Total Commission</th>
              <th>Net Earnings</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(monthlyData)
              .filter(([month]) => month !== "All")
              .map(([month, data], index) => (
                <tr key={index}>
                  <td>{month}</td>
                  <td>{data.totalOrders}</td>
                  <td>{data.totalRevenue}</td>
                  <td>{data.totalCommission}</td>
                  <td className="net-earning">
                    ₹
                    {(
                      parseInt(data.totalRevenue.replace(/[₹,]/g, "")) -
                      parseInt(data.totalCommission.replace(/[₹,]/g, ""))
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

      </div>

    </div>
  );
};

export default Earnings;
