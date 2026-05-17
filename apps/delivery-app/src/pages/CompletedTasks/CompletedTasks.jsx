import { useState, useMemo } from "react";
import "./CompletedTasks.css";

// ── SVG Icon helper ──────────────────────────────────────────────────────────
const Svg = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IC = {
  check:   "M20 6L9 17l-5-5",
  user:    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  device:  "M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z",
  pickup:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  drop:    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  clock:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  search:  "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  id:      "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 10h8M8 14h4",
  chevron: "M6 9l6 6 6-6",
};

// ── Dummy Data ───────────────────────────────────────────────────────────────
const TODAY = "Today";
const TASKS = [
  { id:"CMP-3001", customer:"Priya Sharma",  device:"Laptop",     pickup:"12 MG Road, Buxar",        delivery:"34 Nehru Colony, Patna",      time:"08:45 AM", date: TODAY },
  { id:"CMP-3002", customer:"Arjun Mehta",   device:"Smartphone", pickup:"7 Civil Lines, Ara",        delivery:"88 Station Road, Varanasi",   time:"09:20 AM", date: TODAY },
  { id:"CMP-3003", customer:"Sunita Verma",  device:"Tablet",     pickup:"22 Park Ave, Chapra",       delivery:"15 Gandhi Nagar, Muzaffarpur",time:"10:05 AM", date: TODAY },
  { id:"CMP-3004", customer:"Rahul Gupta",   device:"Smartwatch", pickup:"5 Model Town, Bhagalpur",  delivery:"67 Raja Bazar, Patna",        time:"11:30 AM", date: TODAY },
  { id:"CMP-3005", customer:"Kavita Singh",  device:"Earbuds",    pickup:"9 Ashoka Road, Ghazipur",  delivery:"3 MG Road, Buxar",            time:"12:00 PM", date: TODAY },
  { id:"CMP-3006", customer:"Amit Kumar",    device:"Camera",     pickup:"41 Shivaji Nagar, Ara",    delivery:"18 Civil Lines, Chapra",       time:"01:15 PM", date:"Yesterday" },
  { id:"CMP-3007", customer:"Deepa Tiwari",  device:"Laptop",     pickup:"77 Lal Bagh, Patna",       delivery:"2 Station Road, Bhagalpur",   time:"02:40 PM", date:"Yesterday" },
  { id:"CMP-3008", customer:"Vikram Yadav",  device:"Tablet",     pickup:"30 Tilak Nagar, Varanasi", delivery:"11 Nehru Nagar, Ara",          time:"03:55 PM", date:"Yesterday" },
  { id:"CMP-3009", customer:"Meena Dubey",   device:"Smartphone", pickup:"6 Sector 4, Muzaffarpur",  delivery:"56 Model Town, Buxar",        time:"04:30 PM", date:"2 days ago" },
  { id:"CMP-3010", customer:"Suresh Pandey", device:"Smartwatch", pickup:"14 Raja Park, Bhagalpur",  delivery:"29 Gandhi Road, Ghazipur",    time:"05:10 PM", date:"2 days ago" },
];

const DEVICE_OPTIONS = ["All Devices", ...Array.from(new Set(TASKS.map(t => t.device)))];
const DATE_OPTIONS   = ["All Time", TODAY, "Yesterday", "2 days ago"];

// ── InfoRow ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, valueClass }) {
  return (
    <div className="completed-task-info-row">
      <div className="completed-task-info-icon"><Svg d={icon} /></div>
      <div>
        <div className="completed-task-info-label">{label}</div>
        <div className={`completed-task-info-value ${valueClass || ""}`}>{value}</div>
      </div>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
function DetailsModal({ task, onClose }) {
  const rows = [
    { icon: IC.id,     label: "Order ID",          value: task.id },
    { icon: IC.user,   label: "Customer",           value: task.customer },
    { icon: IC.device, label: "Device",             value: task.device },
    { icon: IC.pickup, label: "Pickup Address",     value: task.pickup },
    { icon: IC.drop,   label: "Delivery Address",   value: task.delivery },
    { icon: IC.clock,  label: "Completed Time",     value: `${task.date} · ${task.time}` },
  ];
  return (
    <div className="completed-task-modal-overlay" onClick={onClose}>
      <div className="completed-task-modal" onClick={e => e.stopPropagation()}>
        <div className="completed-task-modal-header">
          <span className="completed-task-modal-title">Task Details</span>
          <button className="completed-task-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="completed-task-modal-body">
          {rows.map(r => (
            <div className="completed-task-modal-row" key={r.label}>
              <div className="completed-task-modal-icon"><Svg d={r.icon} /></div>
              <div>
                <div className="completed-task-modal-row-label">{r.label}</div>
                <div className="completed-task-modal-row-value">{r.value}</div>
              </div>
            </div>
          ))}
          <div className="completed-task-modal-row">
            <div className="completed-task-modal-icon"><Svg d={IC.check} /></div>
            <div>
              <div className="completed-task-modal-row-label">Status</div>
              <span className="completed-task-badge">
                <span className="completed-task-badge-dot" />Completed
              </span>
            </div>
          </div>
        </div>
        <div className="completed-task-modal-footer">
          <button className="completed-task-btn completed-task-btn-outline"
            style={{ padding: "9px 28px" }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
function TaskCard({ task, onView }) {
  return (
    <div className="completed-task-card">
      <div className="completed-task-card-header">
        <span className="completed-task-order-id">{task.id}</span>
        <span className="completed-task-badge">
          <span className="completed-task-badge-dot" />Completed
        </span>
      </div>
      <div className="completed-task-info">
        <InfoRow icon={IC.user}   label="Customer"         value={task.customer} />
        <InfoRow icon={IC.device} label="Device"           value={task.device} />
        <InfoRow icon={IC.pickup} label="Pickup Address"   value={task.pickup} />
        <InfoRow icon={IC.drop}   label="Delivery Address" value={task.delivery} />
        <InfoRow icon={IC.clock}  label="Completed"
          value={`${task.date} · ${task.time}`}
          valueClass="completed-task-time-value" />
      </div>
      <hr className="completed-task-divider" />
      <div className="completed-task-card-footer">
        <button className="completed-task-btn completed-task-btn-outline"
          onClick={() => onView(task)}>View Details</button>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function CompletedTasks() {
  const [search,     setSearch]     = useState("");
  const [deviceFilt, setDeviceFilt] = useState("All Devices");
  const [dateFilt,   setDateFilt]   = useState("All Time");
  const [modal,      setModal]      = useState(null);

  const todayCount = useMemo(() => TASKS.filter(t => t.date === TODAY).length, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TASKS.filter(t => {
      const matchQ = !q ||
        t.id.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.device.toLowerCase().includes(q) ||
        t.pickup.toLowerCase().includes(q) ||
        t.delivery.toLowerCase().includes(q);
      const matchD = deviceFilt === "All Devices" || t.device === deviceFilt;
      const matchDate = dateFilt === "All Time" || t.date === dateFilt;
      return matchQ && matchD && matchDate;
    });
  }, [search, deviceFilt, dateFilt]);

  return (
    <div className="completed-task-page">

      {/* Header */}
   

      <main className="completed-task-container">

        {/* Top Section */}
        <div className="completed-task-top">
          <div>
            <div className="completed-task-page-title">Completed Tasks</div>
            <div className="completed-task-page-desc">All successfully delivered orders</div>
          </div>
          <div className="completed-task-summary">
            <div className="completed-task-summary-card">
              <div className="completed-task-summary-label">Total Completed</div>
              <div className="completed-task-summary-value">{TASKS.length}</div>
              <div className="completed-task-summary-sub">All time</div>
            </div>
            <div className="completed-task-summary-card">
              <div className="completed-task-summary-label">Today's Tasks</div>
              <div className="completed-task-summary-value">{todayCount}</div>
              <div className="completed-task-summary-sub">Completed today</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="completed-task-toolbar">
          <div className="completed-task-search-wrap">
            <svg className="completed-task-search-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={IC.search} />
            </svg>
            <input
              className="completed-task-search"
              type="text"
              placeholder="Search order, customer, device…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="completed-task-select-wrap">
            <select className="completed-task-select"
              value={deviceFilt} onChange={e => setDeviceFilt(e.target.value)}>
              {DEVICE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <svg className="completed-task-select-arrow" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={IC.chevron} />
            </svg>
          </div>

          <div className="completed-task-select-wrap">
            <select className="completed-task-select"
              value={dateFilt} onChange={e => setDateFilt(e.target.value)}>
              {DATE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <svg className="completed-task-select-arrow" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={IC.chevron} />
            </svg>
          </div>
        </div>

        <div className="completed-task-count">
          Showing {filtered.length} of {TASKS.length} completed tasks
        </div>

        {/* Grid */}
        <div className="completed-task-grid">
          {filtered.length === 0 ? (
            <div className="completed-task-empty">
              <div className="completed-task-empty-icon">📋</div>
              <div className="completed-task-empty-title">No tasks found</div>
              <div className="completed-task-empty-text">Try adjusting your search or filters.</div>
            </div>
          ) : (
            filtered.map(t => (
              <TaskCard key={t.id} task={t} onView={setModal} />
            ))
          )}
        </div>
      </main>

      {modal && <DetailsModal task={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
