import { useState, useRef } from "react";
import {
  Package, CheckCircle2, XCircle, Clock,
  TrendingUp, TrendingDown, Truck, MapPin, Timer
} from "lucide-react";
import "./PerformanceReports.css";

// ── All data sets for filter ──────────────────────────────────────────
const ALL_DATA = {
  "This Week": {
    kpis: [
      { label: "Total Deliveries", value: 28, change: "+12%", trend: "up", icon: "package", detail: "4 more than last week" },
      { label: "Completed",        value: 25, change: "+10%", trend: "up", icon: "check",   detail: "89% completion rate" },
      { label: "Cancelled",        value: 2,  change: "-5%",  trend: "down", icon: "x",    detail: "2 less than last week" },
      { label: "Avg. Delivery Time", value: "28 mins", change: "+8%", trend: "up", icon: "clock", detail: "2 mins faster than last week" },
    ],
    chart: [
      { day: "Mon", completed: 33, cancelled: 2 },
      { day: "Tue", completed: 18, cancelled: 2 },
      { day: "Wed", completed: 30, cancelled: 2 },
      { day: "Thu", completed: 28, cancelled: 2 },
      { day: "Fri", completed: 50, cancelled: 2 },
      { day: "Sat", completed: 26, cancelled: 2 },
      { day: "Sun", completed: 33, cancelled: 2 },
    ],
    summary: { onTime: 92, rating: 4.6, earnings: "₹12,450", distance: "156 km" },
  },
  "This Month": {
    kpis: [
      { label: "Total Deliveries", value: 112, change: "+18%", trend: "up", icon: "package", detail: "17 more than last month" },
      { label: "Completed",        value: 104, change: "+15%", trend: "up", icon: "check",   detail: "92% completion rate" },
      { label: "Cancelled",        value: 8,   change: "+2%",  trend: "down", icon: "x",    detail: "Slightly more cancellations" },
      { label: "Avg. Delivery Time", value: "26 mins", change: "+12%", trend: "up", icon: "clock", detail: "4 mins faster than last month" },
    ],
    chart: [
      { day: "Wk 1", completed: 24, cancelled: 2 },
      { day: "Wk 2", completed: 30, cancelled: 3 },
      { day: "Wk 3", completed: 28, cancelled: 1 },
      { day: "Wk 4", completed: 22, cancelled: 2 },
    ],
    summary: { onTime: 95, rating: 4.8, earnings: "₹48,200", distance: "620 km" },
  },
  "Last Month": {
    kpis: [
      { label: "Total Deliveries", value: 95, change: "-4%", trend: "down", icon: "package", detail: "4 less than previous month" },
      { label: "Completed",        value: 88, change: "-3%", trend: "down", icon: "check",   detail: "92% completion rate" },
      { label: "Cancelled",        value: 7,  change: "+1%", trend: "down", icon: "x",       detail: "1 more cancellation" },
      { label: "Avg. Delivery Time", value: "30 mins", change: "-5%", trend: "down", icon: "clock", detail: "2 mins slower" },
    ],
    chart: [
      { day: "Wk 1", completed: 20, cancelled: 1 },
      { day: "Wk 2", completed: 25, cancelled: 2 },
      { day: "Wk 3", completed: 22, cancelled: 3 },
      { day: "Wk 4", completed: 21, cancelled: 1 },
    ],
    summary: { onTime: 88, rating: 4.3, earnings: "₹38,750", distance: "510 km" },
  },
  "This Year": {
    kpis: [
      { label: "Total Deliveries", value: 1240, change: "+22%", trend: "up", icon: "package", detail: "224 more than last year" },
      { label: "Completed",        value: 1180, change: "+20%", trend: "up", icon: "check",   detail: "95% completion rate" },
      { label: "Cancelled",        value: 60,   change: "-8%",  trend: "down", icon: "x",    detail: "5 less on avg per month" },
      { label: "Avg. Delivery Time", value: "27 mins", change: "+15%", trend: "up", icon: "clock", detail: "Best year so far" },
    ],
    chart: [
      { day: "Jan", completed: 90, cancelled: 5 },
      { day: "Feb", completed: 85, cancelled: 4 },
      { day: "Mar", completed: 100, cancelled: 6 },
      { day: "Apr", completed: 110, cancelled: 5 },
      { day: "May", completed: 120, cancelled: 7 },
      { day: "Jun", completed: 105, cancelled: 4 },
    ],
    summary: { onTime: 94, rating: 4.7, earnings: "₹5,24,000", distance: "7,200 km" },
  },
};

const FILTER_OPTIONS = ["This Week", "This Month", "Last Month", "This Year"];

// ── Bar Chart with hover tooltip ──────────────────────────────────────
function BarChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const maxVal = Math.max(...data.map(d => d.completed + d.cancelled), 10);
  const chartH = 180;
  const chartW = 500;
  const barW = Math.min(36, Math.floor((chartW - 60) / data.length - 10));
  const gap = Math.floor((chartW - 40 - data.length * barW) / (data.length - 1 || 1));
  const offsetX = 30;
  const yTicks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 36}`} style={{ overflow: "visible" }}>
        {yTicks.map((tick, ti) => {
          const y = chartH - (tick / maxVal) * chartH;
          return (
            <g key={ti}>
              <line x1={offsetX} y1={y} x2={chartW} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={offsetX - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#cbd5e1">{tick}</text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = offsetX + i * (barW + gap);
          const completedH = (d.completed / maxVal) * chartH;
          const cancelledH = (d.cancelled / maxVal) * chartH;
          const totalH = completedH + cancelledH;
          const isHov = hovered === i;

          return (
            <g key={d.day}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Hover bg highlight */}
              {isHov && (
                <rect x={x - 6} y={0} width={barW + 12} height={chartH + 28}
                  fill="#f8faff" rx={8} />
              )}
              {/* Completed bar */}
              <rect x={x} y={chartH - completedH} width={barW} height={completedH}
                fill={isHov ? "#16a34a" : "#22c55e"} rx={4}
                style={{ transition: "fill 0.15s" }} />
              {/* Cancelled bar */}
              {cancelledH > 0 && (
                <rect x={x} y={chartH - totalH} width={barW} height={cancelledH}
                  fill={isHov ? "#b91c1c" : "#ef4444"} rx={4}
                  style={{ transition: "fill 0.15s" }} />
              )}
              {/* Top value */}
              <text x={x + barW / 2} y={chartH - totalH - 6} textAnchor="middle"
                fontSize={10} fill={isHov ? "#1e40af" : "#64748b"} fontWeight="700">
                {d.completed + d.cancelled}
              </text>
              {/* Day label */}
              <text x={x + barW / 2} y={chartH + 18} textAnchor="middle"
                fontSize={10} fill={isHov ? "#1e40af" : "#94a3b8"} fontWeight={isHov ? "700" : "400"}>
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hovered !== null && (() => {
        const d = data[hovered];
        const barW2 = Math.min(36, Math.floor((500 - 60) / data.length - 10));
        const gap2 = Math.floor((500 - 40 - data.length * barW2) / (data.length - 1 || 1));
        const xPos = ((30 + hovered * (barW2 + gap2) + barW2 / 2) / 500) * 100;
        return (
          <div style={{
            position: "absolute",
            top: 0,
            left: `${Math.min(Math.max(xPos, 10), 80)}%`,
            transform: "translateX(-50%)",
            background: "#0f172a",
            color: "white",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            pointerEvents: "none",
            zIndex: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
            minWidth: 130,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: "#93c5fd" }}>{d.day}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: 2, display: "inline-block" }} />
              Completed: <strong>{d.completed}</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, background: "#ef4444", borderRadius: 2, display: "inline-block" }} />
              Cancelled: <strong>{d.cancelled}</strong>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────
function ProgressBar({ value, max = 100 }) {
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 99, height: 6, overflow: "hidden" }}>
      <div style={{
        width: `${(value / max) * 100}%`,
        background: "linear-gradient(90deg, #22c55e, #16a34a)",
        height: "100%", borderRadius: 99, transition: "width 0.8s ease"
      }} />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────
function KpiCard({ label, value, change, trend, icon }) {
  const isUp = trend === "up";
  const props = { size: 18, strokeWidth: 2 };
  const iconMap = {
    package: <Package {...props} />,
    check: <CheckCircle2 {...props} />,
    x: <XCircle {...props} />,
    clock: <Clock {...props} />,
  };

  return (
    <div className="pr-kpi-card">
      <div className="pr-kpi-icon-wrap">{iconMap[icon] || <Package {...props} />}</div>
      <p className="pr-kpi-label">{label}</p>
      <p className="pr-kpi-value">{value}</p>
      <div className={`pr-kpi-change ${isUp ? "positive" : "negative"}`}>
        {isUp ? <TrendingUp size={13} strokeWidth={2.5} /> : <TrendingDown size={13} strokeWidth={2.5} />}
        {change}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function PerformanceReports() {
  const [filter, setFilter] = useState("This Week");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const { kpis, chart, summary } = ALL_DATA[filter];

  return (
      <div className="pr-page">

      <div className="pr-header">
        <div className="pr-header-text">
          <h1 className="pr-title">Performance Reports</h1>
          <p className="pr-subtitle">Track deliveries, ratings, and earnings</p>
        </div>

        <div ref={dropRef} className="pr-filter-wrap">
          <button
            onClick={() => setDropOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "white", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: "8px 14px",
              fontSize: 13, fontWeight: 600, color: "#334155",
              cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.15s",
              outline: "none",
            }}
          >
            <Timer size={14} color="#6366f1" />
            {filter}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: dropOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: "white", borderRadius: 12, border: "1px solid #e2e8f0",
              boxShadow: "0 12px 32px rgba(0,0,0,0.12)", zIndex: 100,
              overflow: "hidden", minWidth: 150,
              animation: "fadeIn 0.12s ease",
            }}>
              {FILTER_OPTIONS.map(opt => (
                <div key={opt}
                  onClick={() => { setFilter(opt); setDropOpen(false); }}
                  style={{
                    padding: "10px 16px", fontSize: 13, fontWeight: 500,
                    color: filter === opt ? "#6366f1" : "#334155",
                    background: filter === opt ? "#f0f0ff" : "transparent",
                    cursor: "pointer",
                    fontWeight: filter === opt ? 700 : 500,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (filter !== opt) e.target.style.background = "#f8fafc"; }}
                  onMouseLeave={e => { if (filter !== opt) e.target.style.background = "transparent"; }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="pr-kpi-grid" >
        {kpis.map((k, i) => <KpiCard key={`${filter}-${i}`} {...k} />)}
      </div>

      <div className="pr-main-grid">
        <div className="pr-panel pr-chart-wrap">
          <h2 className="pr-panel-title">Deliveries Overview</h2>
          <BarChart data={chart} />
          <div className="pr-chart-legend">
            {[["#22c55e", "Completed"], ["#ef4444", "Cancelled"]].map(([color, label]) => (
              <div key={label} className="pr-legend-item">
                <span className="pr-legend-dot" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="pr-panel pr-summary-panel">
          <h2 className="pr-panel-title">Performance Summary</h2>

          <div className="pr-summary-body">
            <div className="pr-summary-row">
              <span className="pr-summary-label">On Time Delivery</span>
              <span className="pr-summary-val">{summary.onTime}%</span>
            </div>
            <ProgressBar value={summary.onTime} />

            <div className="pr-summary-row">
              <span className="pr-summary-label">Customer Rating</span>
              <span className="pr-summary-val">{summary.rating}/5</span>
            </div>
            <ProgressBar value={summary.rating} max={5} />

            <div className="pr-summary-divider" />

            {[
              { icon: <Truck size={15} />, label: "Total Earnings", val: summary.earnings },
              { icon: <MapPin size={15} />, label: "Distance Covered", val: summary.distance },
            ].map(({ icon, label, val }) => (
              <div key={label} className="pr-summary-stat">
                <div className="pr-summary-stat-left">
                  <span className="pr-summary-stat-icon">{icon}</span>
                  <span className="pr-summary-label">{label}</span>
                </div>
                <span className="pr-summary-val">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
