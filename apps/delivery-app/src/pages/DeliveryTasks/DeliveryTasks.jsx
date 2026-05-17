import { useState } from "react";
import "./DeliveryTasks.css";

// ── Icons (inline SVG helpers) ──────────────────────────────────────────────
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  truck:   "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  user:    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  map:     "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  device:  "M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z",
  clock:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  search:  "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  id:      "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 10h8M8 14h4",
};

// ── Dummy Data ──────────────────────────────────────────────────────────────
const TASKS = [
  { id: "ORD-4821", customer: "Priya Sharma",    address: "12 MG Road, Buxar, Bihar 802101",          device: "Laptop",     time: "10:30 AM",  status: "Pending" },
  { id: "ORD-4822", customer: "Arjun Mehta",     address: "45 Park Street, Patna, Bihar 800001",       device: "Smartphone", time: "11:00 AM",  status: "Out For Delivery" },
  { id: "ORD-4823", customer: "Sunita Verma",    address: "7 Civil Lines, Varanasi, UP 221001",        device: "Tablet",     time: "09:45 AM",  status: "Delivered" },
  { id: "ORD-4824", customer: "Rahul Gupta",     address: "88 Nehru Nagar, Ara, Bihar 802301",         device: "Smartwatch", time: "12:15 PM",  status: "Pending" },
  { id: "ORD-4825", customer: "Kavita Singh",    address: "3 Ashoka Road, Ghazipur, UP 233001",        device: "Laptop",     time: "02:00 PM",  status: "Out For Delivery" },
  { id: "ORD-4826", customer: "Amit Kumar",      address: "19 Station Road, Motihari, Bihar 845401",   device: "Earbuds",    time: "03:30 PM",  status: "Delivered" },
  { id: "ORD-4827", customer: "Deepa Tiwari",    address: "56 Gandhi Nagar, Chapra, Bihar 841301",     device: "Tablet",     time: "04:00 PM",  status: "Pending" },
  { id: "ORD-4828", customer: "Vikram Yadav",    address: "22 Model Town, Bhagalpur, Bihar 812001",    device: "Smartphone", time: "05:15 PM",  status: "Out For Delivery" },
  { id: "ORD-4829", customer: "Meena Dubey",     address: "101 Raja Bazar, Muzaffarpur, Bihar 842001", device: "Camera",     time: "01:45 PM",  status: "Delivered" },
];

const FILTERS = ["All", "Pending", "Out For Delivery", "Delivered"];

const badgeClass = (status) => ({
  "Pending":          "delivery-task-badge-pending",
  "Out For Delivery": "delivery-task-badge-out",
  "Delivered":        "delivery-task-badge-delivered",
}[status] ?? "");

const statColor = { "Pending": "#f97316", "Out For Delivery": "#2563eb", "Delivered": "#16a34a" };

// ── Sub-components ──────────────────────────────────────────────────────────
function InfoRow({ iconPath, label, value }) {
  return (
    <div className="delivery-task-info-row">
      <div className="delivery-task-info-icon">
        <Icon d={iconPath} />
      </div>
      <div className="delivery-task-info-content">
        <div className="delivery-task-info-label">{label}</div>
        <div className="delivery-task-info-value">{value}</div>
      </div>
    </div>
  );
}

function DetailsModal({ task, onClose }) {
  const rows = [
    { icon: Icons.id,     label: "Order ID",      value: task.id },
    { icon: Icons.user,   label: "Customer",      value: task.customer },
    { icon: Icons.map,    label: "Address",       value: task.address },
    { icon: Icons.device, label: "Device",        value: task.device },
    { icon: Icons.clock,  label: "Delivery Time", value: task.time },
  ];
  return (
    <div className="delivery-task-modal-overlay" onClick={onClose}>
      <div className="delivery-task-modal" onClick={e => e.stopPropagation()}>
        <div className="delivery-task-modal-header">
          <span className="delivery-task-modal-title">Order Details</span>
          <button className="delivery-task-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="delivery-task-modal-body">
          {rows.map(r => (
            <div className="delivery-task-modal-row" key={r.label}>
              <div className="delivery-task-modal-row-icon"><Icon d={r.icon} /></div>
              <div>
                <div className="delivery-task-modal-row-label">{r.label}</div>
                <div className="delivery-task-modal-row-value">{r.value}</div>
              </div>
            </div>
          ))}
          <div className="delivery-task-modal-row">
            <div className="delivery-task-modal-row-icon"><Icon d={Icons.truck} /></div>
            <div>
              <div className="delivery-task-modal-row-label">Status</div>
              <span className={`delivery-task-badge ${badgeClass(task.status)}`}>{task.status}</span>
            </div>
          </div>
        </div>
        <div className="delivery-task-modal-footer">
          <button className="delivery-task-btn delivery-task-btn-secondary" onClick={onClose}
            style={{ flex: "0 0 auto", padding: "9px 24px" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function DeliveryCard({ task, onViewDetails, onStartDelivery }) {
  return (
    <div className="delivery-task-card">
      <div className="delivery-task-card-header">
        <span className="delivery-task-order-id">{task.id}</span>
        <span className={`delivery-task-badge ${badgeClass(task.status)}`}>{task.status}</span>
      </div>

      <div className="delivery-task-info">
        <InfoRow iconPath={Icons.user}   label="Customer"      value={task.customer} />
        <InfoRow iconPath={Icons.map}    label="Address"       value={task.address} />
        <InfoRow iconPath={Icons.device} label="Device"        value={task.device} />
        <InfoRow iconPath={Icons.clock}  label="Delivery Time" value={task.time} />
      </div>

      <hr className="delivery-task-divider" />

      <div className="delivery-task-card-actions">
        <button
          className="delivery-task-btn delivery-task-btn-primary"
          onClick={() => onStartDelivery(task)}
          disabled={task.status === "Delivered"}
        >
          {task.status === "Delivered" ? "✓ Delivered" : "Start Delivery"}
        </button>
        <button
          className="delivery-task-btn delivery-task-btn-secondary"
          onClick={() => onViewDetails(task)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// ── Header stats ────────────────────────────────────────────────────────────
function StatPill({ label, status, count }) {
  return (
    <div className="delivery-task-stat-pill">
      <span className="delivery-task-stat-dot" style={{ background: statColor[status] }} />
      <span>{count} {label}</span>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function DeliveryTasks() {
  const [tasks, setTasks] = useState(TASKS);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [modal, setModal] = useState(null);

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      t.id.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q) ||
      t.device.toLowerCase().includes(q);
    const matchFilter = activeFilter === "All" || t.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleStartDelivery = (task) => {
    setTasks(prev => prev.map(t =>
      t.id === task.id
        ? { ...t, status: t.status === "Pending" ? "Out For Delivery" : t.status }
        : t
    ));
  };

  const counts = {
    Pending:          tasks.filter(t => t.status === "Pending").length,
    "Out For Delivery": tasks.filter(t => t.status === "Out For Delivery").length,
    Delivered:        tasks.filter(t => t.status === "Delivered").length,
  };

  return (
    <div className="delivery-task-page">
      {/* Header */}


      {/* Content */}
      <main className="delivery-task-container">
        {/* Toolbar */}
        <div className="delivery-task-toolbar">
          <div className="delivery-task-search-wrap">
            <svg className="delivery-task-search-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={Icons.search} />
            </svg>
            <input
              className="delivery-task-search"
              type="text"
              placeholder="Search by order, customer, device…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="delivery-task-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`delivery-task-filter-btn ${activeFilter === f ? "delivery-task-filter-active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="delivery-task-count">
          Showing {filtered.length} of {tasks.length} orders
        </div>

        {/* Cards Grid */}
        <div className="delivery-task-grid">
          {filtered.length === 0 ? (
            <div className="delivery-task-empty">
              <div className="delivery-task-empty-icon">📦</div>
              <div className="delivery-task-empty-title">No tasks found</div>
              <div className="delivery-task-empty-text">Try adjusting your search or filter.</div>
            </div>
          ) : (
            filtered.map(task => (
              <DeliveryCard
                key={task.id}
                task={task}
                onViewDetails={setModal}
                onStartDelivery={handleStartDelivery}
              />
            ))
          )}
        </div>
      </main>

      {/* Details Modal */}
      {modal && <DetailsModal task={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
