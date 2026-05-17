// Delivery.jsx — Dummy Data Version

import React, { useState } from "react";
import "./../styles/delivery.css";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";

// ── Dummy Data ──────────────────────────────────────────────
const dummyAssigned = [
  {
    id: "ORD-2011",
    customer: "Rohit Gupta",
    email: "rohit@gmail.com",
    device: "iPhone 14 Pro",
    amount: "₹6,800",
    date: "May 10, 2026",
    assignedTo: "Ravi Kumar",
  },
  {
    id: "ORD-2012",
    customer: "Sneha Joshi",
    email: "sneha@gmail.com",
    device: "Samsung S23",
    amount: "₹4,200",
    date: "May 10, 2026",
    assignedTo: "Suresh Pal",
  },
  {
    id: "ORD-2013",
    customer: "Mohit Sharma",
    email: "mohit@gmail.com",
    device: "Redmi Note 12",
    amount: "₹2,100",
    date: "May 09, 2026",
    assignedTo: "Deepak Singh",
  },
];

const dummyReady = [
  {
    id: "ORD-2014",
    customer: "Ankit Yadav",
    email: "ankit@gmail.com",
    device: "OnePlus 12",
    amount: "₹5,500",
    date: "May 09, 2026",
    assignedTo: "Ravi Kumar",
  },
  {
    id: "ORD-2015",
    customer: "Pooja Mishra",
    email: "pooja@gmail.com",
    device: "Vivo V27",
    amount: "₹3,300",
    date: "May 08, 2026",
    assignedTo: "Suresh Pal",
  },
];

const dummyOut = [
  {
    id: "ORD-2016",
    customer: "Rajan Tiwari",
    email: "rajan@gmail.com",
    device: "iPhone 13",
    amount: "₹7,200",
    date: "May 10, 2026",
    assignedTo: "Deepak Singh",
  },
  {
    id: "ORD-2017",
    customer: "Kavya Singh",
    email: "kavya@gmail.com",
    device: "Realme 11 Pro",
    amount: "₹2,800",
    date: "May 10, 2026",
    assignedTo: "Ravi Kumar",
  },
  {
    id: "ORD-2018",
    customer: "Nikhil Verma",
    email: "nikhil@gmail.com",
    device: "POCO X5",
    amount: "₹1,950",
    date: "May 09, 2026",
    assignedTo: "Suresh Pal",
  },
];
// ────────────────────────────────────────────────────────────

const Delivery = () => {
  const [activeTab, setActiveTab] = useState("assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const [assigned, setAssigned] = useState(dummyAssigned);
  const [ready, setReady] = useState(dummyReady);
  const [out, setOut] = useState(dummyOut);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filterList = (list) =>
    list.filter((o) =>
      searchQuery.trim() === ""
        ? true
        : o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.device.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handlePickedUpFromCustomer = (order) => {
    setAssigned((prev) => prev.filter((o) => o.id !== order.id));
    showToast(`${order.id} picked up — moved to Repairing!`);
  };

  const handlePickedUpFromShop = (order) => {
    setReady((prev) => prev.filter((o) => o.id !== order.id));
    setOut((prev) => [...prev, order]);
    showToast(`${order.id} picked up from shop — Out for Delivery!`);
  };

  const handleDelivered = (order) => {
    setOut((prev) => prev.filter((o) => o.id !== order.id));
    showToast(`${order.id} delivered successfully! ✓`);
  };

  const tabCounts = {
    assigned: assigned.length,
    ready: ready.length,
    out: out.length,
  };

  const currentList =
    activeTab === "assigned"
      ? filterList(assigned)
      : activeTab === "ready"
      ? filterList(ready)
      : filterList(out);

  const currentType =
    activeTab === "assigned" ? "assigned" : activeTab === "ready" ? "ready" : "out";

  const renderCard = (order, type) => (
    <div className="delivery-card" key={order.id}>
      <div className="dc-top">
        <div className="dc-id-row">
          <span className="dc-id">{order.id}</span>
          <span className={`dc-status-dot ${type}`}></span>
          <span className="dc-status-label">
            {type === "assigned" && "Awaiting Pickup"}
            {type === "ready"    && "Ready at Shop"}
            {type === "out"      && "Out for Delivery"}
          </span>
        </div>
        <span className="dc-amount">{order.amount}</span>
      </div>

      <div className="dc-device">
        <Package size={15} />
        {order.device}
      </div>

      <div className="dc-customer">
        <div className="dc-avatar">{order.customer.charAt(0)}</div>
        <div className="dc-customer-info">
          <p className="dc-name">{order.customer}</p>
          <p className="dc-email">{order.email}</p>
        </div>
      </div>

      {order.assignedTo && (
        <div className="dc-assigned-to">
          <Truck size={14} />
          Assigned to: <strong>{order.assignedTo}</strong>
        </div>
      )}

      <div className="dc-meta">
        <span><Clock size={13} /> {order.date}</span>
      </div>

      <div className="dc-actions">
        {type === "assigned" && (
          <button
            className="dc-btn pickup-customer-btn"
            onClick={() => handlePickedUpFromCustomer(order)}
          >
            <Package size={15} />
            Picked Up from Customer
          </button>
        )}
        {type === "ready" && (
          <button
            className="dc-btn pickup-shop-btn"
            onClick={() => handlePickedUpFromShop(order)}
          >
            <Truck size={15} />
            Picked Up from Shop
          </button>
        )}
        {type === "out" && (
          <button
            className="dc-btn delivered-btn"
            onClick={() => handleDelivered(order)}
          >
            <CheckCircle2 size={15} />
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="delivery-page">

      {toast && <div className={`delivery-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="delivery-header">
        <h1>Delivery Manager</h1>
        <p>Track pickups, shop dispatches, and deliveries in real time</p>
      </div>

      <div className="delivery-stats">
        <div className="stat-card stat-assigned">
          <span className="stat-num">{assigned.length}</span>
          <span className="stat-label">Awaiting Pickup</span>
        </div>
        <div className="stat-card stat-ready">
          <span className="stat-num">{ready.length}</span>
          <span className="stat-label">Ready at Shop</span>
        </div>
        <div className="stat-card stat-out">
          <span className="stat-num">{out.length}</span>
          <span className="stat-label">Out for Delivery</span>
        </div>
        <div className="stat-card stat-total">
          <span className="stat-num">{assigned.length + ready.length + out.length}</span>
          <span className="stat-label">Total Active</span>
        </div>
      </div>

      <div className="delivery-tabs">
        {[
          { key: "assigned", label: "Awaiting Pickup",  icon: <Package size={16} /> },
          { key: "ready",    label: "Ready at Shop",    icon: <RefreshCw size={16} /> },
          { key: "out",      label: "Out for Delivery", icon: <Truck size={16} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`delivery-tab ${activeTab === tab.key ? "active-tab" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className="tab-count">{tabCounts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="delivery-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="delivery-grid">
        {currentList.length === 0 ? (
          <div className="delivery-empty">
            <Package size={40} />
            <p>No orders in this section</p>
          </div>
        ) : (
          currentList.map((order) => renderCard(order, currentType))
        )}
      </div>

    </div>
  );
};

export default Delivery;
