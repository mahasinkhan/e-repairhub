// Orders.jsx (Updated)
// - Pending rows: "Assign" button → opens assign modal → order goes to Delivery page
// - Repairing rows: "Complete" button → delivery boy gets notified to pickup from shop

import React, { useState } from "react";
import "./../styles/orders.css";
import {
  Search,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  UserPlus,
  CheckCircle,
  X,
} from "lucide-react";
import { initialOrders } from "./order";

const deliveryBoys = [
  { id: "DB-01", name: "Ravi Kumar" },
  { id: "DB-02", name: "Suresh Pal" },
  { id: "DB-03", name: "Deepak Singh" },
];

const Orders = ({ orders = initialOrders, setOrders = () => {} }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignModal, setAssignModal] = useState(null); // order to assign
  const [selectedBoy, setSelectedBoy] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredOrders = orders
    .filter((o) =>
      activeFilter === "All" ? true : o.status === activeFilter
    )
    .filter((o) =>
      searchQuery.trim() === ""
        ? true
        : o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.device.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAssign = () => {
    if (!selectedBoy) return;
    const boy = deliveryBoys.find((b) => b.id === selectedBoy);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === assignModal.id
          ? { ...o, status: "Assigned", assignedTo: boy.name, pickedUp: false }
          : o
      )
    );
    showToast(`Order ${assignModal.id} assigned to ${boy.name}`);
    setAssignModal(null);
    setSelectedBoy("");
  };

  const handleComplete = (order) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: "ReadyForPickup" } : o
      )
    );
    showToast(`Order ${order.id} marked ready — delivery boy notified!`);
  };

  return (
    <div className="orders-page">

      {/* Toast */}
      {toast && (
        <div className={`orders-toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* Top Section */}
      <div className="orders-header">
        <h1>Repair Orders</h1>
        <p>Track and manage all customer repair requests</p>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <div className="status-filters">
          {["All", "Completed", "Repairing", "Pending", "Cancelled", "Delivered", "Assigned", "ReadyForPickup"].map(
            (item) => (
              <button
                key={item}
                className={activeFilter === item ? "active-filter" : ""}
                onClick={() => setActiveFilter(item)}
              >
                {item === "ReadyForPickup" ? "Ready for Pickup" : item}
              </button>
            )
          )}
        </div>

        <div className="table-actions">
          <button>
            <SlidersHorizontal size={18} />
            Columns
          </button>
          <button>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-box">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search repair orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Device</th>
              <th>Status</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={index}>
                <td className="order-id">{order.id}</td>

                <td>
                  <div className="customer-info">
                    <div className="avatar">{order.customer.charAt(0)}</div>
                    <div>
                      <h4>{order.customer}</h4>
                      <p>{order.email}</p>
                    </div>
                  </div>
                </td>

                <td>{order.device}</td>

                <td>
                  <span className={`status-badge ${order.status.toLowerCase().replace(/\s/g, "")}`}>
                    {order.status === "ReadyForPickup" ? "Ready for Pickup" : order.status}
                  </span>
                </td>

                <td>{order.date}</td>
                <td className="amount">{order.amount}</td>

                {/* ACTION COLUMN */}
                <td>
                  {order.status === "Pending" && (
                    <button
                      className="action-btn assign-btn"
                      onClick={() => setAssignModal(order)}
                    >
                      <UserPlus size={15} />
                      Assign
                    </button>
                  )}
                  {order.status === "Repairing" && (
                    <button
                      className="action-btn complete-btn"
                      onClick={() => handleComplete(order)}
                    >
                      <CheckCircle size={15} />
                      Complete
                    </button>
                  )}
                  {order.status === "Assigned" && (
                    <span className="assigned-label">
                      👤 {order.assignedTo}
                    </span>
                  )}
                  {order.status === "ReadyForPickup" && (
                    <span className="pickup-label">
                      📦 Pickup Pending
                    </span>
                  )}
                </td>

                <td>
                  <button className="more-btn">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Delivery Boy</h3>
              <button className="modal-close" onClick={() => setAssignModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-order-info">
                <span>{assignModal.id}</span> — {assignModal.device} — {assignModal.customer}
              </p>
              <label>Select Delivery Boy</label>
              <div className="boy-list">
                {deliveryBoys.map((boy) => (
                  <div
                    key={boy.id}
                    className={`boy-card ${selectedBoy === boy.id ? "selected" : ""}`}
                    onClick={() => setSelectedBoy(boy.id)}
                  >
                    <div className="boy-avatar">{boy.name.charAt(0)}</div>
                    <div>
                      <p className="boy-name">{boy.name}</p>
                      <p className="boy-id">{boy.id}</p>
                    </div>
                    {selectedBoy === boy.id && (
                      <CheckCircle size={18} className="boy-check" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setAssignModal(null)}>
                Cancel
              </button>
              <button
                className={`modal-confirm ${!selectedBoy ? "disabled" : ""}`}
                onClick={handleAssign}
                disabled={!selectedBoy}
              >
                Confirm Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
