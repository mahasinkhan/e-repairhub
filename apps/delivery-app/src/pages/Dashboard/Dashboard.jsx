import { useState, useEffect, useRef } from 'react'
import {
  ClipboardList,
  PackageSearch,
  Truck,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  MapPin,
  ChevronRight,
  IndianRupee,
  ChevronDown,
} from 'lucide-react'
import './Dashboard.css'

/* ─────────────────────────────────────────
   DUMMY DATA  (swap with API calls later)
───────────────────────────────────────── */
function getAgentGreeting() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const full = user?.name || 'Ramesh Kumar'
    const first = full.split(/\s+/)[0] || 'Ramesh'
    return { first, full }
  } catch {
    return { first: 'Ramesh', full: 'Ramesh Kumar' }
  }
}

const TODAY = new Date().toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const STATS = [
  {
    key: 'tasks',
    label: "Today's Tasks",
    value: 5,
    sub: '+2 from yesterday',
    up: true,
    icon: ClipboardList,
    color: 'stat-blue',
  },
  {
    key: 'pickups',
    label: 'Pending Pickups',
    value: 7,
    sub: '3 urgent',
    up: false,
    icon: PackageSearch,
    color: 'stat-orange',
  },
  {
    key: 'deliveries',
    label: 'Pending Deliveries',
    value: 3,
    sub: 'Out for delivery',
    up: true,
    icon: Truck,
    color: 'stat-purple',
  },
  {
    key: 'completed',
    label: 'Completed Tasks',
    value: 12,
    sub: 'Delivered today',
    up: true,
    icon: CheckCircle2,
    color: 'stat-green',
  },
]

const PROGRESS = {
  completed: 10,
  inTransit: 5,
  pending: 2,
}
const TOTAL_PROGRESS = PROGRESS.completed + PROGRESS.inTransit + PROGRESS.pending
const PROGRESS_PCT = Math.round((PROGRESS.completed / TOTAL_PROGRESS) * 100)

// Earnings sparkline data (last 7 days)
const EARNINGS_DATA = [820, 1100, 950, 1400, 1200, 1650, 1850]
const EARNINGS_TODAY = 1850
const EARNINGS_YESTERDAY = 1650

// Upcoming tasks table
const UPCOMING_TASKS = [
  { id: 'ORD-4821', name: 'Neeraj Tiwari',   type: 'Pickup',   time: '9:30 AM',  pickup: 'Sector 18, Noida',      status: 'Pending'    },
  { id: 'ORD-4822', name: 'Priya Mehta',     type: 'Delivery', time: '10:00 AM', pickup: 'Connaught Place',        status: 'In Transit' },
  { id: 'ORD-4823', name: 'Amit Singh',      type: 'Pickup',   time: '10:45 AM', pickup: 'Karol Bagh',             status: 'Picked'     },
  { id: 'ORD-4824', name: 'Sneha Kapoor',    type: 'Delivery', time: '11:30 AM', pickup: 'Janakpuri',              status: 'Delivered'  },
  { id: 'ORD-4825', name: 'Rahul Gupta',     type: 'Pickup',   time: '12:15 PM', pickup: 'Greater Kailash',        status: 'Pending'    },
]

// Live location marker (dummy coords — Delhi)
const LIVE_LOCATION = { lat: 28.6139, lng: 77.2090, label: 'Connaught Place, Delhi' }

/* ─────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function Counter({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let cur = 0
    const step = Math.max(1, Math.ceil(value / 25))
    const t = setInterval(() => {
      cur += step
      if (cur >= value) { setDisplay(value); clearInterval(t) }
      else setDisplay(cur)
    }, 40)
    return () => clearInterval(t)
  }, [value])
  return <>{display}</>
}

/* ─────────────────────────────────────────
   DONUT CHART (SVG)
───────────────────────────────────────── */
function DonutChart({ pct }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="donut-svg">
      {/* track */}
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      {/* inTransit arc */}
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke="#f97316" strokeWidth="14"
        strokeDasharray={`${((PROGRESS.inTransit / TOTAL_PROGRESS) * circ).toFixed(2)} ${circ}`}
        strokeDashoffset={-(((PROGRESS.completed / TOTAL_PROGRESS) * circ)).toFixed(2)}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dasharray 1s ease' }}
      />
      {/* completed arc */}
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke="#3b82f6" strokeWidth="14"
        strokeDasharray={`${((PROGRESS.completed / TOTAL_PROGRESS) * circ).toFixed(2)} ${circ}`}
        strokeDashoffset="0"
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dasharray 1s ease' }}
      />
      {/* center text */}
      <text x="70" y="64" textAnchor="middle" className="donut-pct-text">{pct}%</text>
      <text x="70" y="80" textAnchor="middle" className="donut-sub-text">Completed</text>
    </svg>
  )
}

/* ─────────────────────────────────────────
   SPARKLINE CHART (SVG)
───────────────────────────────────────── */
function Sparkline({ data }) {
  const W = 200, H = 60
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 8) - 4
    return `${x},${y}`
  })
  const pathD = `M${pts.join(' L')}`
  const areaD = `M${pts[0]} L${pts.join(' L')} L${W},${H} L0,${H} Z`

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="sparkline-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#spark-grad)" />
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   MAP PLACEHOLDER (shows OSM iframe)
───────────────────────────────────────── */
function LiveMap() {
  return (
    <div className="map-wrap">
      <iframe
        title="Live Location"
        src="https://www.openstreetmap.org/export/embed.html?bbox=77.18,28.59,77.24,28.64&layer=mapnik&marker=28.6139,77.2090"
        className="map-iframe"
        loading="lazy"
      />
      <div className="map-pin-label">
        <MapPin size={14} />
        <span>{LIVE_LOCATION.label}</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────── */
function StatusBadge({ status }) {
  const cls = {
    'Pending':    'badge-pending',
    'In Transit': 'badge-transit',
    'Picked':     'badge-picked',
    'Delivered':  'badge-delivered',
    'Cancelled':  'badge-cancelled',
  }
  return <span className={`db-badge ${cls[status] || ''}`}>{status}</span>
}

/* ─────────────────────────────────────────
   DASHBOARD PAGE
───────────────────────────────────────── */
export default function Dashboard() {
  const earningsDiff = EARNINGS_TODAY - EARNINGS_YESTERDAY
  const earningsUp = earningsDiff >= 0
  const agent = getAgentGreeting()

  return (
    <div className="db-root">

      {/* ── GREETING (below top header) ── */}
      <div className="db-header">
        <div className="db-greeting-block">
          <h2 className="db-greeting">
            Good Morning, {agent.first} <span className="db-wave" aria-hidden>👋</span>
          </h2>
          <p className="db-subgreeting">Ready to deliver excellence today!</p>
        </div>
        <button type="button" className="db-datePicker" aria-label="Selected date">
          <span>{TODAY}</span>
          <ChevronDown size={16} className="db-dateChevron" aria-hidden />
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="db-stats-row">
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.key} className={`db-stat-card ${s.color}`}>
              <div className="db-stat-top">
                <div className="db-stat-icon-wrap">
                  <Icon size={22} className="db-stat-icon" />
                </div>
                <div className={`db-stat-trend ${s.up ? 'trend-up' : 'trend-down'}`}>
                  {s.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
              </div>
              <p className="db-stat-value"><Counter value={s.value} /></p>
              <p className="db-stat-label">{s.label}</p>
              <p className="db-stat-sub">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* ── MIDDLE ROW: Progress + Earnings + Map ── */}
      <div className="db-mid-row">

        {/* Today's Progress */}
        <div className="db-card db-progress-card">
          <div className="db-card-header">
            <h3 className="db-card-title">Today's Progress</h3>
          </div>
          <div className="db-progress-body">
            <DonutChart pct={PROGRESS_PCT} />
            <div className="db-progress-legend">
              <div className="db-legend-item">
                <span className="db-legend-dot dot-blue" />
                <span className="db-legend-label">Completed</span>
                <span className="db-legend-val">{PROGRESS.completed}</span>
              </div>
              <div className="db-legend-item">
                <span className="db-legend-dot dot-orange" />
                <span className="db-legend-label">In Transit</span>
                <span className="db-legend-val">{PROGRESS.inTransit}</span>
              </div>
              <div className="db-legend-item">
                <span className="db-legend-dot dot-gray" />
                <span className="db-legend-label">Pending</span>
                <span className="db-legend-val">{PROGRESS.pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Today */}
        <div className="db-card db-earnings-card">
          <div className="db-card-header">
            <h3 className="db-card-title">Earnings Today</h3>
          </div>
          <div className="db-earnings-amount">
            <IndianRupee size={20} className="db-rupee-icon" />
            <span className="db-earnings-value">{EARNINGS_TODAY.toLocaleString('en-IN')}</span>
          </div>
          <div className={`db-earnings-diff ${earningsUp ? 'diff-up' : 'diff-down'}`}>
            {earningsUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>₹{Math.abs(earningsDiff).toLocaleString('en-IN')} vs yesterday</span>
          </div>
          <div className="db-sparkline-wrap">
            <Sparkline data={EARNINGS_DATA} />
          </div>
          <div className="db-sparkline-labels">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} className="db-spark-day">{d}</span>
            ))}
          </div>
        </div>

        {/* Live Location */}
        <div className="db-card db-map-card">
          <div className="db-card-header">
            <h3 className="db-card-title">Live Location</h3>
            <span className="db-live-badge">
              <span className="db-live-dot" />
              LIVE
            </span>
          </div>
          <LiveMap />
        </div>

      </div>

      {/* ── UPCOMING TASKS ── */}
      <div className="db-card db-tasks-card">
        <div className="db-card-header">
          <h3 className="db-card-title">Upcoming Tasks</h3>
          <button type="button" className="db-view-all">
            View All <ChevronRight size={15} />
          </button>
        </div>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Time</th>
                <th>Pickup Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {UPCOMING_TASKS.map((t) => (
                <tr key={t.id} className="db-task-row">
                  <td><span className="db-order-id">{t.id}</span></td>
                  <td className="db-name">{t.name}</td>
                  <td>
                    <span className={`db-type-badge ${t.type === 'Pickup' ? 'type-pickup' : 'type-delivery'}`}>
                      {t.type === 'Pickup' ? <PackageSearch size={11} /> : <Truck size={11} />}
                      {t.type}
                    </span>
                  </td>
                  <td className="db-time">{t.time}</td>
                  <td className="db-pickup-addr">
                    <MapPin size={12} className="db-addr-pin" />
                    {t.pickup}
                  </td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
