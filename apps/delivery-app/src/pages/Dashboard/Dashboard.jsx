import { useState, useEffect } from 'react'
import {
  MdArrowForward,
  MdCheckCircle,
  MdElectricMoped,
  MdHourglassEmpty,
  MdInventory2,
  MdLocalShipping,
  MdMap,
  MdNotifications,
  MdPlace,
  MdQrCodeScanner,
  MdStar,
  MdTrendingDown,
  MdTrendingUp,
  MdVpnKey,
} from 'react-icons/md'
import './Dashboard.css'

const AGENT = {
  name: 'Arjun Sharma',
  id: 'AGT-00412',
  avatar: 'AS',
  zone: 'Delhi NCR – Zone 4',
}

const STATS = [
  {
    label: 'Total Tasks',
    value: 48,
    Icon: MdInventory2,
    sub: 'Assigned today',
    pct: '+12%',
    up: true,
    gradient: 'grad-blue',
  },
  {
    label: 'Pending Pickups',
    value: 7,
    Icon: MdElectricMoped,
    sub: 'Awaiting action',
    pct: '-3%',
    up: false,
    gradient: 'grad-orange',
  },
  {
    label: 'Pending Deliveries',
    value: 11,
    Icon: MdLocalShipping,
    sub: 'Out for delivery',
    pct: '+5%',
    up: true,
    gradient: 'grad-purple',
  },
  {
    label: 'Completed',
    value: 30,
    Icon: MdCheckCircle,
    sub: 'Delivered today',
    pct: '+18%',
    up: true,
    gradient: 'grad-green',
  },
]

const WEEKLY = [
  { day: 'Mon', val: 72 },
  { day: 'Tue', val: 58 },
  { day: 'Wed', val: 85 },
  { day: 'Thu', val: 63 },
  { day: 'Fri', val: 91 },
  { day: 'Sat', val: 47 },
  { day: 'Sun', val: 30 },
]

const TASKS = [
  { id: 'ORD-9841', customer: 'Priya Mehta', device: 'iPhone 14 Pro', pickup: 'Sector 18, Noida', delivery: 'Lajpat Nagar, Delhi', type: 'Pickup', status: 'Pending', time: '09:30 AM' },
  { id: 'ORD-9842', customer: 'Rahul Gupta', device: 'Samsung S23', pickup: 'Connaught Place', delivery: 'Dwarka Sec 10', type: 'Delivery', status: 'In Transit', time: '10:00 AM' },
  { id: 'ORD-9843', customer: 'Sneha Kapoor', device: 'MacBook Air M2', pickup: 'Karol Bagh', delivery: 'Rohini Sec 14', type: 'Pickup', status: 'Picked', time: '10:45 AM' },
  { id: 'ORD-9844', customer: 'Amit Singh', device: 'OnePlus 11', pickup: 'Janakpuri', delivery: 'Saket', type: 'Delivery', status: 'Delivered', time: '11:15 AM' },
  { id: 'ORD-9845', customer: 'Kavya Reddy', device: 'iPad Pro 12.9', pickup: 'Greater Kailash', delivery: 'Vasant Kunj', type: 'Delivery', status: 'Cancelled', time: '12:00 PM' },
  { id: 'ORD-9846', customer: 'Neeraj Tiwari', device: 'Realme GT Neo', pickup: 'Pitampura', delivery: 'Shalimar Bagh', type: 'Pickup', status: 'Pending', time: '01:30 PM' },
]

const QUICK_ACTIONS = [
  { label: 'Start Pickup', Icon: MdPlace, color: 'qa-blue' },
  { label: 'Start Delivery', Icon: MdLocalShipping, color: 'qa-green' },
  { label: 'Verify OTP', Icon: MdVpnKey, color: 'qa-purple' },
  { label: 'Open Maps', Icon: MdMap, color: 'qa-orange' },
  { label: 'Notifications', Icon: MdNotifications, color: 'qa-red' },
  { label: 'Scan QR', Icon: MdQrCodeScanner, color: 'qa-teal' },
]

const LIVE_ITEMS = [
  { label: 'Riders Active', val: 1, Icon: MdElectricMoped, pct: 100, color: '#22c55e' },
  { label: 'Picked Today', val: 18, Icon: MdInventory2, pct: 75, color: '#6c63ff' },
  { label: 'Delivered Today', val: 30, Icon: MdCheckCircle, pct: 62, color: '#3b82f6' },
  { label: 'Running Tasks', val: 11, Icon: MdHourglassEmpty, pct: 46, color: '#f97316' },
]

function StatusBadge({ status }) {
  const map = {
    Pending: 'badge-pending',
    Picked: 'badge-picked',
    'In Transit': 'badge-transit',
    Delivered: 'badge-delivered',
    Cancelled: 'badge-cancelled',
  }
  return <span className={`badge ${map[status] || ''}`}>{status}</span>
}

function AnimatedCount({ target }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 30)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else setCount(start)
    }, 40)
    return () => clearInterval(timer)
  }, [target])
  return <span>{count}</span>
}

function CircularProgress({ pct, color, label }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="circ-wrap">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} className="circ-track" />
        <circle
          cx="44"
          cy="44"
          r={r}
          className="circ-fill"
          style={{ stroke: color, strokeDasharray: circ, strokeDashoffset: offset }}
        />
      </svg>
      <div className="circ-label">
        <span className="circ-pct" style={{ color }}>
          {pct}%
        </span>
        <span className="circ-sub">{label}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="dash-root">
      <div className="dash-main">
        <div className="dash-content">
          <div className="zone-bar">
            <span className="zone-label">
              <MdPlace className="zone-icon" aria-hidden />
              Zone: <strong>{AGENT.zone}</strong>
            </span>
            <span className="zone-id">
              Agent ID: <strong>{AGENT.id}</strong>
            </span>
          </div>

          <section className="stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className={`stat-card ${s.gradient}`}>
                <div className="stat-top">
                  <div className="stat-info">
                    <p className="stat-label">{s.label}</p>
                    <h2 className="stat-value">
                      <AnimatedCount target={s.value} />
                    </h2>
                    <p className="stat-sub">{s.sub}</p>
                  </div>
                  <div className="stat-icon-wrap" aria-hidden>
                    <s.Icon className="stat-svg" />
                  </div>
                </div>
                <div className={`stat-pct ${s.up ? 'pct-up' : 'pct-down'}`}>
                  {s.up ? <MdTrendingUp className="trend-ico" /> : <MdTrendingDown className="trend-ico" />} {s.pct}{' '}
                  vs yesterday
                </div>
              </div>
            ))}
          </section>

          <section className="analytics-section">
            <div className="analytics-card chart-card">
              <h3 className="section-title">Weekly Deliveries</h3>
              <div className="bar-chart">
                {WEEKLY.map((w, i) => (
                  <div key={w.day} className="bar-col">
                    <div className="bar-outer">
                      <div
                        className="bar-inner"
                        style={{ height: `${w.val}%`, animationDelay: `${i * 80}ms` }}
                      >
                        <span className="bar-val">{w.val}</span>
                      </div>
                    </div>
                    <span className="bar-day">{w.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card perf-card">
              <h3 className="section-title">Performance</h3>
              <div className="circ-row">
                <CircularProgress pct={88} color="#6c63ff" label="Success Rate" />
                <CircularProgress pct={63} color="#f97316" label="On-Time" />
                <CircularProgress pct={95} color="#22c55e" label="OTP Rate" />
              </div>
              <div className="perf-stats">
                {[
                  { label: 'Avg Delivery Time', val: '34 min' },
                  {
                    label: 'Customer Rating',
                    val: (
                      <>
                        4.8 <MdStar className="inline-star" aria-hidden />
                      </>
                    ),
                  },
                  { label: 'Tasks This Month', val: '312' },
                  { label: 'Distance Covered', val: '1,240 km' },
                ].map((p) => (
                  <div key={p.label} className="perf-item">
                    <span className="perf-label">{p.label}</span>
                    <span className="perf-val">{p.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="live-section">
            <h3 className="section-title">Live Delivery Status</h3>
            <div className="live-grid">
              {LIVE_ITEMS.map((l) => (
                <div key={l.label} className="live-card">
                  <div className="live-top">
                    <span className="live-icon" aria-hidden>
                      <l.Icon />
                    </span>
                    <span className="live-val">{l.val}</span>
                  </div>
                  <p className="live-label">{l.label}</p>
                  <div className="live-bar-bg">
                    <div className="live-bar-fill" style={{ width: `${l.pct}%`, background: l.color }} />
                  </div>
                  {l.label === 'Riders Active' && <span className="pulse-active">● LIVE</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="qa-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="qa-grid">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} type="button" className={`qa-btn ${a.color}`}>
                  <span className="qa-icon" aria-hidden>
                    <a.Icon />
                  </span>
                  <span className="qa-label">{a.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="tasks-section">
            <div className="tasks-header">
              <h3 className="section-title">Recent Tasks</h3>
              <button type="button" className="view-all-btn">
                View All <MdArrowForward className="btn-ico-inline" aria-hidden />
              </button>
            </div>
            <div className="table-wrap">
              <table className="tasks-table">
                <thead>
                  <tr>
                    {['Order ID', 'Customer', 'Device', 'Pickup', 'Delivery', 'Type', 'Status', 'Time', 'Actions'].map(
                      (h) => (
                        <th key={h}>{h}</th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {TASKS.map((t) => (
                    <tr key={t.id} className="task-row">
                      <td>
                        <span className="order-id">{t.id}</span>
                      </td>
                      <td>{t.customer}</td>
                      <td>
                        <span className="device-chip">{t.device}</span>
                      </td>
                      <td className="addr">{t.pickup}</td>
                      <td className="addr">{t.delivery}</td>
                      <td>
                        <span className={`type-badge ${t.type === 'Pickup' ? 'type-pickup' : 'type-delivery'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="time-cell">{t.time}</td>
                      <td>
                        <div className="action-btns">
                          <button type="button" className="act-btn act-view">
                            View
                          </button>
                          <button type="button" className="act-btn act-start">
                            Start
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="dash-footer">
            <span>© 2024 SwiftDrop Logistics · Agent Portal v2.1</span>
            <span>Powered by SwiftDrop Engine</span>
          </footer>
        </div>
      </div>
    </div>
  )
}
