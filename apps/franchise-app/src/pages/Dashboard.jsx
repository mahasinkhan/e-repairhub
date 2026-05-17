import { useMemo, useRef, useState } from 'react'
import {
  Package,
  Timer,
  Wrench,
  CheckCircle2,
  PackagePlus,
  Truck,
  MonitorSmartphone,
  Sparkles,
} from 'lucide-react'
import StatusBadge from '../components/cards/StatusBadge'
import '../styles/dashboard.css'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const REPAIR_SERIES = [42, 48, 52, 61, 58, 66, 72, 70, 78, 81, 88, 94]
const EARNINGS_SERIES = [28, 32, 35, 40, 38, 45, 50, 48, 55, 60, 58, 68]
const DELIVERY_SERIES = [18, 22, 26, 30, 34, 33, 38, 41, 44, 46, 50, 52]

const DONUT_SEGMENTS = [
  {
    key: 'pending',
    label: 'Pending',
    pct: 18,
    fill: '#eab308',
    swatch: 'dash-donut__swatch--pending',
  },
  {
    key: 'repairing',
    label: 'Repairing',
    pct: 24,
    fill: '#3b82f6',
    swatch: 'dash-donut__swatch--repairing',
  },
  {
    key: 'completed',
    label: 'Completed',
    pct: 38,
    fill: '#22c55e',
    swatch: 'dash-donut__swatch--completed',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    pct: 20,
    fill: '#9333ea',
    swatch: 'dash-donut__swatch--delivered',
  },
]

function polar(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

function donutWedgePath(cx, cy, innerR, outerR, a0, a1) {
  const largeArc = a1 - a0 > Math.PI ? 1 : 0
  const p1 = polar(cx, cy, outerR, a0)
  const p2 = polar(cx, cy, outerR, a1)
  const p3 = polar(cx, cy, innerR, a1)
  const p4 = polar(cx, cy, innerR, a0)
  return `M ${p1.x} ${p1.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`
}

function buildDonutSlices() {
  const cx = 100
  const cy = 100
  const outerR = 72
  const innerR = 44
  let angle = -Math.PI / 2
  return DONUT_SEGMENTS.map((seg, index) => {
    const sweep = (seg.pct / 100) * 2 * Math.PI
    const a0 = angle
    const a1 = angle + sweep
    angle = a1
    return {
      ...seg,
      index,
      d: donutWedgePath(cx, cy, innerR, outerR, a0, a1),
    }
  })
}

const DONUT_SLICES = buildDonutSlices()

function RepairStatusDonut({ activeKey, setActiveKey, total }) {
  const tip = useMemo(() => {
    if (!activeKey) return null
    const seg = DONUT_SEGMENTS.find((s) => s.key === activeKey)
    if (!seg) return null
    const count = Math.round((total * seg.pct) / 100)
    return {
      title: seg.label,
      pct: seg.pct,
      count,
    }
  }, [activeKey, total])

  return (
    <div className={`dash-donut dash-donut--svg${activeKey ? ' dash-donut--has-hover' : ''}`}>
      <svg
        className={`dash-donut-svg${activeKey ? ' dash-donut-svg--dim' : ''}`}
        viewBox="0 0 200 200"
        role="img"
        aria-label="Repair status distribution"
      >
        {DONUT_SLICES.map((s) => (
          <path
            key={s.key}
            d={s.d}
            fill={s.fill}
            className={`dash-donut-svg__path dash-donut-svg__path--i${s.index}${activeKey === s.key ? ' dash-donut-svg__path--active' : ''}`}
            onMouseEnter={() => setActiveKey(s.key)}
          />
        ))}
      </svg>
      <div className="dash-donut__center">
        <span className="dash-donut__total-label">Total repairs</span>
        <span className="dash-donut__total">{total}</span>
      </div>
      {tip ? (
        <div className="dash-donut-floattip" role="status">
          <span className="dash-donut-floattip__k">{tip.title}</span>
          <span className="dash-donut-floattip__v">
            {tip.pct}% · {tip.count} tickets
          </span>
          <span className="dash-donut-floattip__s">Franchise repair queue</span>
        </div>
      ) : null}
    </div>
  )
}

const TOTAL_REPAIRS = 842

const ORDERS = [
  {
    id: 'REP-ORD-240891',
    device: 'MacBook Pro 14" (M3)',
    amount: '₹18,400',
    status: 'Repairing',
    name: 'Ananya Mehta',
    email: 'ananya.mehta@email.com',
    initials: 'AM',
  },
  {
    id: 'REP-ORD-240884',
    device: 'Galaxy S24 Ultra',
    amount: '₹12,250',
    status: 'Pending',
    name: 'Rohan Kapoor',
    email: 'rohan.k@email.com',
    initials: 'RK',
  },
  {
    id: 'REP-ORD-240872',
    device: 'Dell XPS 15',
    amount: '₹9,900',
    status: 'Completed',
    name: 'Sneha Iyer',
    email: 'sneha.iyer@email.com',
    initials: 'SI',
  },
  {
    id: 'REP-ORD-240865',
    device: 'iPhone 15 Pro',
    amount: '₹14,600',
    status: 'Delivered',
    name: 'Vikram Joshi',
    email: 'vikram.j@email.com',
    initials: 'VJ',
  },
  {
    id: 'REP-ORD-240858',
    device: 'ThinkPad T14 Gen 4',
    amount: '₹11,200',
    status: 'Repairing',
    name: 'Priya Nair',
    email: 'priya.nair@email.com',
    initials: 'PN',
  },
  {
    id: 'REP-ORD-240851',
    device: 'Pixel 8 Pro',
    amount: '₹10,450',
    status: 'Delivered',
    name: 'Dev Shah',
    email: 'dev.shah@email.com',
    initials: 'DS',
  },
]

const ACTIVITIES = [
  {
    icon: PackagePlus,
    title: 'New repair assigned',
    desc: 'REP-ORD-240891 routed to North City bench · display assembly queue.',
    time: '6 min ago',
    tone: 'dash-activity__icon--violet',
  },
  {
    icon: Truck,
    title: 'Device picked up',
    desc: 'Courier OTP verified for Galaxy S24 Ultra inbound diagnostic.',
    time: '24 min ago',
    tone: 'dash-activity__icon--cyan',
  },
  {
    icon: Wrench,
    title: 'Repair started',
    desc: 'Technician began board-level trace on Dell XPS power rail ticket.',
    time: '1 hr ago',
    tone: 'dash-activity__icon--blue',
  },
  {
    icon: MonitorSmartphone,
    title: 'Display replaced',
    desc: 'OEM panel calibrated · awaiting QC soak for MacBook Pro 14".',
    time: '2 hrs ago',
    tone: 'dash-activity__icon--amber',
  },
  {
    icon: CheckCircle2,
    title: 'Repair completed',
    desc: 'QC signed off · device bagged for customer pickup window.',
    time: '3 hrs ago',
    tone: 'dash-activity__icon--green',
  },
  {
    icon: Sparkles,
    title: 'Delivery assigned',
    desc: 'Last-mile partner booked for ORD-240865 · ETA today 6:30 PM.',
    time: '5 hrs ago',
    tone: 'dash-activity__icon--slate',
  },
]

function formatPerfTooltip(mode, val, month) {
  if (mode === 'repairs') {
    return {
      line1: `${month}`,
      line2: `${val} assigned jobs`,
      line3: 'Monthly franchise throughput',
    }
  }
  if (mode === 'earnings') {
    const rupee = val * 14250
    return {
      line1: `${month}`,
      line2: `₹${rupee.toLocaleString('en-IN')}`,
      line3: 'Est. payout-ready revenue',
    }
  }
  return {
    line1: `${month}`,
    line2: `${val} on-time handovers`,
    line3: 'Courier / pickup completions',
  }
}

function PerformanceChart({ mode }) {
  const series = useMemo(() => {
    if (mode === 'earnings') return EARNINGS_SERIES
    if (mode === 'deliveries') return DELIVERY_SERIES
    return REPAIR_SERIES
  }, [mode])
  const svgRef = useRef(null)
  const [hoverIdx, setHoverIdx] = useState(null)

  const geom = useMemo(() => {
    const w = 720
    const h = 220
    const pad = 12
    const max = Math.max(...series)
    const min = Math.min(...series)
    const span = max - min || 1
    const points = series.map((v, i) => {
      const x = pad + (i / (series.length - 1)) * (w - pad * 2)
      const y = pad + (1 - (v - min) / span) * (h - pad * 2)
      return { x, y, v }
    })
    const pathLine = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ')
    const pathArea = `${pathLine} L${w - pad},${h - pad} L${pad},${h - pad} Z`
    return { points, pathLine, pathArea, w, h, pad }
  }, [series])

  const gradId =
    mode === 'earnings' ? 'perfGradEarn' : mode === 'deliveries' ? 'perfGradDel' : 'perfGradRep'

  const onMove = (e) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const xSvg = ((e.clientX - rect.left) / rect.width) * geom.w
    const inner = geom.w - geom.pad * 2
    const ratio = Math.min(1, Math.max(0, (xSvg - geom.pad) / inner))
    const idx = Math.round(ratio * (geom.points.length - 1))
    setHoverIdx(idx)
  }

  const onLeave = () => setHoverIdx(null)

  const tip =
    hoverIdx !== null ? formatPerfTooltip(mode, geom.points[hoverIdx].v, MONTHS[hoverIdx]) : null
  const hx = hoverIdx !== null ? geom.points[hoverIdx].x : 0
  const hy = hoverIdx !== null ? geom.points[hoverIdx].y : 0

  return (
    <div className="dash-performance__chart-wrap dash-chart-entrance">
      <svg
        ref={svgRef}
        className="dash-performance__svg dash-performance__svg--interactive"
        viewBox="0 0 720 220"
        preserveAspectRatio="none"
        role="img"
        aria-label="Performance chart"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <defs>
          <linearGradient id="perfGradRep" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="perfGradEarn" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="perfGradDel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className={`dash-performance__plot dash-performance__plot--${mode}`}>
          <path className="dash-performance__area" d={geom.pathArea} fill={`url(#${gradId})`} />
          <path
            className="dash-performance__line"
            d={geom.pathLine}
            fill="none"
            pathLength={1}
          />
        </g>
        {hoverIdx !== null ? (
          <g className={`dash-performance__cursor dash-performance__cursor--${mode}`}>
            <line
              className="dash-performance__cursor-line"
              x1={hx}
              y1={geom.pad}
              x2={hx}
              y2={geom.h - geom.pad}
            />
            <circle className="dash-performance__cursor-dot" cx={hx} cy={hy} r="6" />
            <circle className="dash-performance__cursor-ring" cx={hx} cy={hy} r="10" />
          </g>
        ) : null}
      </svg>
      {tip ? (
        <div
          className="dash-performance__tooltip"
          style={{ left: `${(hx / geom.w) * 100}%` }}
          role="status"
        >
          <span className="dash-performance__tooltip-k">{tip.line1}</span>
          <span className="dash-performance__tooltip-v">{tip.line2}</span>
          <span className="dash-performance__tooltip-s">{tip.line3}</span>
        </div>
      ) : null}
    </div>
  )
}

function MiniSparkline({ className, stroke, values, label }) {
  const w = 120
  const h = 36
  const [idx, setIdx] = useState(null)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const path = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / span) * (h - 6) - 3
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const barW = w / values.length

  return (
    <div className="dash-spark-wrap dash-spark-entrance">
      <svg
        className={className}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden
        onMouseLeave={() => setIdx(null)}
      >
        <path className="dash-stat-card__spark-fill" d={`${path} L${w},${h} L0,${h} Z`} />
        <path
          className="dash-stat-card__spark-line"
          d={path}
          stroke={stroke}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {values.map((_, i) => (
          <rect
            key={i}
            className="dash-spark-hit"
            x={(i / (values.length - 1)) * w - Math.max(barW, 10) / 2}
            y={0}
            width={Math.max(barW, 10)}
            height={h}
            onMouseEnter={() => setIdx(i)}
            onMouseMove={() => setIdx(i)}
          />
        ))}
        {idx !== null ? (
          <circle
            className="dash-spark-dot"
            cx={(idx / (values.length - 1)) * w}
            cy={h - ((values[idx] - min) / span) * (h - 6) - 3}
            r="3.5"
          />
        ) : null}
      </svg>
      {idx !== null ? (
        <div className="dash-spark-tooltip" style={{ left: `${((idx + 0.5) / values.length) * 100}%` }}>
          <span className="dash-spark-tooltip__k">{MONTHS[idx]}</span>
          <span className="dash-spark-tooltip__v">
            {label}: {values[idx]}
          </span>
        </div>
      ) : null}
    </div>
  )
}

export default function Dashboard() {
  const [perfMode, setPerfMode] = useState('repairs')
  const [donutKey, setDonutKey] = useState(null)

  return (
    <div className="content-shell dash-page">
   

      <section className="dash-stats" aria-label="Key statistics">
        <article className="dash-stat-card dash-stat-card--orange dash-animate dash-animate--d1">
          <div className="dash-stat-card__top">
            <div>
              <p className="dash-stat-card__label">Total assigned orders</p>
              <p className="dash-stat-card__value">186</p>
              <p className="dash-stat-card__delta dash-stat-card__delta--up">+8.4% vs last month</p>
            </div>
            <div className="dash-stat-card__icon" aria-hidden>
              <Package size={22} strokeWidth={2} />
            </div>
          </div>
          <MiniSparkline
            className="dash-stat-card__spark"
            stroke="#ea580c"
            label="Orders trend"
            values={[118, 122, 128, 132, 136, 142, 148, 152, 158, 168, 178, 186]}
          />
        </article>

        <article className="dash-stat-card dash-stat-card--cyan dash-animate dash-animate--d2">
          <div className="dash-stat-card__top">
            <div>
              <p className="dash-stat-card__label">Pending repairs</p>
              <p className="dash-stat-card__value">24</p>
              <p className="dash-stat-card__delta dash-stat-card__delta--down">−3.1% vs last month</p>
            </div>
            <div className="dash-stat-card__icon" aria-hidden>
              <Timer size={22} strokeWidth={2} />
            </div>
          </div>
          <MiniSparkline
            className="dash-stat-card__spark"
            stroke="#0891b2"
            label="Pending intake"
            values={[38, 35, 32, 34, 30, 28, 26, 29, 27, 25, 26, 24]}
          />
        </article>

        <article className="dash-stat-card dash-stat-card--blue dash-animate dash-animate--d3">
          <div className="dash-stat-card__top">
            <div>
              <p className="dash-stat-card__label">Repair in progress</p>
              <p className="dash-stat-card__value">41</p>
              <p className="dash-stat-card__delta dash-stat-card__delta--up">+5.2% vs last month</p>
            </div>
            <div className="dash-stat-card__icon" aria-hidden>
              <Wrench size={22} strokeWidth={2} />
            </div>
          </div>
          <MiniSparkline
            className="dash-stat-card__spark"
            stroke="#2563eb"
            label="Bench active"
            values={[22, 24, 28, 30, 32, 35, 36, 38, 39, 40, 40, 41]}
          />
        </article>

        <article className="dash-stat-card dash-stat-card--lime dash-animate dash-animate--d4">
          <div className="dash-stat-card__top">
            <div>
              <p className="dash-stat-card__label">Completed repairs</p>
              <p className="dash-stat-card__value">121</p>
              <p className="dash-stat-card__delta dash-stat-card__delta--up">+12.0% vs last month</p>
            </div>
            <div className="dash-stat-card__icon" aria-hidden>
              <CheckCircle2 size={22} strokeWidth={2} />
            </div>
          </div>
          <MiniSparkline
            className="dash-stat-card__spark"
            stroke="#65a30d"
            label="Closed jobs"
            values={[72, 78, 82, 86, 90, 94, 98, 102, 108, 112, 118, 121]}
          />
        </article>
      </section>

      <section className="dash-mid dash-animate dash-animate--d5" aria-label="Performance and status">
        <div className="dash-mid__main">
          <article className="dash-panel dash-panel--tall">
            <div className="dash-panel__head">
              <div>
                <h2 className="dash-panel__title">Repair Performance Overview</h2>
                <p className="dash-panel__subtitle">Monthly franchise repair performance</p>
              </div>
              <div className="dash-seg" role="group" aria-label="Chart metric">
                <button
                  type="button"
                  className={`dash-seg__btn${perfMode === 'repairs' ? ' dash-seg__btn--active' : ''}`}
                  onClick={() => setPerfMode('repairs')}
                >
                  Repairs
                </button>
                <button
                  type="button"
                  className={`dash-seg__btn${perfMode === 'earnings' ? ' dash-seg__btn--active' : ''}`}
                  onClick={() => setPerfMode('earnings')}
                >
                  Earnings
                </button>
                <button
                  type="button"
                  className={`dash-seg__btn${perfMode === 'deliveries' ? ' dash-seg__btn--active' : ''}`}
                  onClick={() => setPerfMode('deliveries')}
                >
                  Deliveries
                </button>
              </div>
            </div>
            <div className="dash-performance">
              <PerformanceChart key={perfMode} mode={perfMode} />
              <div className="dash-performance__months" aria-hidden>
                {MONTHS.map((m) => (
                  <span key={m} className="dash-performance__month">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>

        <div className="dash-mid__side">
          <article className="dash-panel">
            <h2 className="dash-panel__title">Repair Status</h2>
            <p className="dash-panel__subtitle">Share of open and closed tickets</p>
            <div
              className="dash-donut-row dash-donut-row--chart"
              onMouseLeave={() => setDonutKey(null)}
            >
              <RepairStatusDonut
                activeKey={donutKey}
                setActiveKey={setDonutKey}
                total={TOTAL_REPAIRS}
              />
              <ul className="dash-donut__legend">
                {DONUT_SEGMENTS.map((s) => (
                  <li
                    key={s.key}
                    className={`dash-donut__legend-item${donutKey === s.key ? ' dash-donut__legend-item--active' : ''}`}
                    onMouseEnter={() => setDonutKey(s.key)}
                  >
                    <span className={`dash-donut__swatch ${s.swatch}`} />
                    {s.label} <strong>{s.pct}%</strong>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="dash-panel">
            <h2 className="dash-panel__title">Monthly goals</h2>
            <p className="dash-panel__subtitle">Targets for this billing cycle</p>
            <div className="dash-goals dash-goals--enter">
              <div className="dash-goal">
                <div className="dash-goal__row">
                  <span className="dash-goal__name">Monthly repair target</span>
                  <span className="dash-goal__pct">78%</span>
                </div>
                <div className="dash-goal__track">
                  <div className="dash-goal__fill dash-goal__fill--blue dash-goal__fill--w78" />
                </div>
              </div>
              <div className="dash-goal">
                <div className="dash-goal__row">
                  <span className="dash-goal__name">Delivery success rate</span>
                  <span className="dash-goal__pct">92%</span>
                </div>
                <div className="dash-goal__track">
                  <div className="dash-goal__fill dash-goal__fill--cyan dash-goal__fill--w92" />
                </div>
              </div>
              <div className="dash-goal">
                <div className="dash-goal__row">
                  <span className="dash-goal__name">Customer satisfaction</span>
                  <span className="dash-goal__pct">94%</span>
                </div>
                <div className="dash-goal__track">
                  <div className="dash-goal__fill dash-goal__fill--violet dash-goal__fill--w94" />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="dash-bottom dash-animate dash-animate--d6" aria-label="Orders and activity">
        <article className="dash-panel dash-panel--table">
          <div className="dash-panel__head dash-panel__head--tight">
            <div>
              <h2 className="dash-panel__title">Recent Repair Orders</h2>
              <p className="dash-panel__subtitle">Latest assigned repair orders</p>
            </div>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <colgroup>
                <col className="dash-col dash-col--cust" />
                <col className="dash-col dash-col--id" />
                <col className="dash-col dash-col--dev" />
                <col className="dash-col dash-col--st" />
                <col className="dash-col dash-col--amt" />
              </colgroup>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Device</th>
                  <th>Repair status</th>
                  <th className="dash-table__th-num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="dash-customer">
                        <span className="dash-customer__avatar" aria-hidden>
                          {o.initials}
                        </span>
                        <span className="dash-customer__meta">
                          <span className="dash-customer__name">{o.name}</span>
                          <span className="dash-customer__email">{o.email}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="dash-table__mono">{o.id}</span>
                    </td>
                    <td>{o.device}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="dash-table__num">{o.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dash-panel dash-panel--activity">
          <h2 className="dash-panel__title">Recent Repair Activity</h2>
          <p className="dash-panel__subtitle">Live events from your franchise queue</p>
          <ul className="dash-activity">
            {ACTIVITIES.map((a) => {
              const Icon = a.icon
              return (
                <li key={a.title} className="dash-activity__item dash-animate-row">
                  <div className={`dash-activity__icon ${a.tone}`}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className="dash-activity__body">
                    <p className="dash-activity__title">{a.title}</p>
                    <p className="dash-activity__desc">{a.desc}</p>
                    <p className="dash-activity__time">{a.time}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </article>
      </section>
    </div>
  )
}
