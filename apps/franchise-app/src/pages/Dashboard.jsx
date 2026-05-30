import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Timer, Wrench, CheckCircle2,
  PackagePlus, Truck, MonitorSmartphone, Sparkles,
  RefreshCw, TrendingUp, IndianRupee,
} from 'lucide-react'
import StatusBadge from '../components/cards/StatusBadge'
import { getMyStats } from '../services/franchise.api.js'
import '../styles/dashboard.css'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const REPAIR_SERIES  = [42, 48, 52, 61, 58, 66, 72, 70, 78, 81, 88, 94]
const EARNINGS_SERIES = [28, 32, 35, 40, 38, 45, 50, 48, 55, 60, 58, 68]
const DELIVERY_SERIES = [18, 22, 26, 30, 34, 33, 38, 41, 44, 46, 50, 52]

const DONUT_SEGMENTS = [
  { key: 'pending',   label: 'Pending',   pct: 18, fill: '#eab308', swatch: 'dash-donut__swatch--pending'   },
  { key: 'repairing', label: 'Repairing', pct: 24, fill: '#3b82f6', swatch: 'dash-donut__swatch--repairing' },
  { key: 'completed', label: 'Completed', pct: 38, fill: '#22c55e', swatch: 'dash-donut__swatch--completed' },
  { key: 'delivered', label: 'Delivered', pct: 20, fill: '#9333ea', swatch: 'dash-donut__swatch--delivered' },
]

function polar(cx, cy, r, a) { return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) } }

function donutWedgePath(cx, cy, innerR, outerR, a0, a1) {
  const largeArc = a1 - a0 > Math.PI ? 1 : 0
  const p1 = polar(cx, cy, outerR, a0), p2 = polar(cx, cy, outerR, a1)
  const p3 = polar(cx, cy, innerR, a1), p4 = polar(cx, cy, innerR, a0)
  return `M ${p1.x} ${p1.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`
}

function buildDonutSlices() {
  let angle = -Math.PI / 2
  return DONUT_SEGMENTS.map((seg, index) => {
    const sweep = (seg.pct / 100) * 2 * Math.PI
    const a0 = angle, a1 = angle + sweep
    angle = a1
    return { ...seg, index, d: donutWedgePath(100, 100, 44, 72, a0, a1) }
  })
}
const DONUT_SLICES = buildDonutSlices()

function RepairStatusDonut({ activeKey, setActiveKey, total }) {
  const tip = useMemo(() => {
    if (!activeKey) return null
    const seg = DONUT_SEGMENTS.find(s => s.key === activeKey)
    if (!seg) return null
    return { title: seg.label, pct: seg.pct, count: Math.round((total * seg.pct) / 100) }
  }, [activeKey, total])

  return (
    <div className={`dash-donut dash-donut--svg${activeKey ? ' dash-donut--has-hover' : ''}`}>
      <svg className={`dash-donut-svg${activeKey ? ' dash-donut-svg--dim' : ''}`}
        viewBox="0 0 200 200" role="img" aria-label="Repair status distribution">
        {DONUT_SLICES.map(s => (
          <path key={s.key} d={s.d} fill={s.fill}
            className={`dash-donut-svg__path dash-donut-svg__path--i${s.index}${activeKey === s.key ? ' dash-donut-svg__path--active' : ''}`}
            onMouseEnter={() => setActiveKey(s.key)} />
        ))}
      </svg>
      <div className="dash-donut__center">
        <span className="dash-donut__total-label">Total repairs</span>
        <span className="dash-donut__total">{total}</span>
      </div>
      {tip && (
        <div className="dash-donut-floattip" role="status">
          <span className="dash-donut-floattip__k">{tip.title}</span>
          <span className="dash-donut-floattip__v">{tip.pct}% · {tip.count} tickets</span>
          <span className="dash-donut-floattip__s">Franchise repair queue</span>
        </div>
      )}
    </div>
  )
}

function formatPerfTooltip(mode, val, month) {
  if (mode === 'earnings') return { line1: month, line2: `₹${(val * 14250).toLocaleString('en-IN')}`, line3: 'Est. payout-ready revenue' }
  if (mode === 'deliveries') return { line1: month, line2: `${val} on-time handovers`, line3: 'Courier / pickup completions' }
  return { line1: month, line2: `${val} assigned jobs`, line3: 'Monthly franchise throughput' }
}

function PerformanceChart({ mode }) {
  const series = useMemo(() => mode === 'earnings' ? EARNINGS_SERIES : mode === 'deliveries' ? DELIVERY_SERIES : REPAIR_SERIES, [mode])
  const svgRef = useRef(null)
  const [hoverIdx, setHoverIdx] = useState(null)

  const geom = useMemo(() => {
    const w = 720, h = 220, pad = 12
    const max = Math.max(...series), min = Math.min(...series), span = max - min || 1
    const points = series.map((v, i) => ({
      x: pad + (i / (series.length - 1)) * (w - pad * 2),
      y: pad + (1 - (v - min) / span) * (h - pad * 2), v,
    }))
    const pathLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    return { points, pathLine, pathArea: `${pathLine} L${w - pad},${h - pad} L${pad},${h - pad} Z`, w, h, pad }
  }, [series])

  const gradId = mode === 'earnings' ? 'perfGradEarn' : mode === 'deliveries' ? 'perfGradDel' : 'perfGradRep'
  const onMove = e => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, ((e.clientX - rect.left) / rect.width * geom.w - geom.pad) / (geom.w - geom.pad * 2)))
    setHoverIdx(Math.round(ratio * (geom.points.length - 1)))
  }
  const tip = hoverIdx !== null ? formatPerfTooltip(mode, geom.points[hoverIdx].v, MONTHS[hoverIdx]) : null
  const hx = hoverIdx !== null ? geom.points[hoverIdx].x : 0
  const hy = hoverIdx !== null ? geom.points[hoverIdx].y : 0

  return (
    <div className="dash-performance__chart-wrap dash-chart-entrance">
      <svg ref={svgRef} className="dash-performance__svg dash-performance__svg--interactive"
        viewBox="0 0 720 220" preserveAspectRatio="none" role="img" aria-label="Performance chart"
        onMouseMove={onMove} onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          <linearGradient id="perfGradRep"  x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient>
          <linearGradient id="perfGradEarn" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ea580c" stopOpacity="0.32"/><stop offset="100%" stopColor="#ea580c" stopOpacity="0"/></linearGradient>
          <linearGradient id="perfGradDel"  x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0d9488" stopOpacity="0.32"/><stop offset="100%" stopColor="#0d9488" stopOpacity="0"/></linearGradient>
        </defs>
        <g className={`dash-performance__plot dash-performance__plot--${mode}`}>
          <path className="dash-performance__area" d={geom.pathArea} fill={`url(#${gradId})`} />
          <path className="dash-performance__line" d={geom.pathLine} fill="none" pathLength={1} />
        </g>
        {hoverIdx !== null && (
          <g className={`dash-performance__cursor dash-performance__cursor--${mode}`}>
            <line className="dash-performance__cursor-line" x1={hx} y1={geom.pad} x2={hx} y2={geom.h - geom.pad} />
            <circle className="dash-performance__cursor-dot" cx={hx} cy={hy} r="6" />
            <circle className="dash-performance__cursor-ring" cx={hx} cy={hy} r="10" />
          </g>
        )}
      </svg>
      {tip && (
        <div className="dash-performance__tooltip" style={{ left: `${(hx / geom.w) * 100}%` }} role="status">
          <span className="dash-performance__tooltip-k">{tip.line1}</span>
          <span className="dash-performance__tooltip-v">{tip.line2}</span>
          <span className="dash-performance__tooltip-s">{tip.line3}</span>
        </div>
      )}
    </div>
  )
}

function MiniSparkline({ className, stroke, values, label }) {
  const w = 120, h = 36
  const [idx, setIdx] = useState(null)
  const max = Math.max(...values), min = Math.min(...values), span = max - min || 1
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / (values.length - 1)) * w).toFixed(1)},${(h - ((v - min) / span) * (h - 6) - 3).toFixed(1)}`).join(' ')
  const barW = w / values.length
  return (
    <div className="dash-spark-wrap dash-spark-entrance">
      <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden onMouseLeave={() => setIdx(null)}>
        <path className="dash-stat-card__spark-fill" d={`${path} L${w},${h} L0,${h} Z`} />
        <path className="dash-stat-card__spark-line" d={path} stroke={stroke} fill="none" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {values.map((_, i) => (
          <rect key={i} className="dash-spark-hit"
            x={(i / (values.length - 1)) * w - Math.max(barW, 10) / 2} y={0}
            width={Math.max(barW, 10)} height={h}
            onMouseEnter={() => setIdx(i)} onMouseMove={() => setIdx(i)} />
        ))}
        {idx !== null && (
          <circle className="dash-spark-dot"
            cx={(idx / (values.length - 1)) * w}
            cy={h - ((values[idx] - min) / span) * (h - 6) - 3} r="3.5" />
        )}
      </svg>
      {idx !== null && (
        <div className="dash-spark-tooltip" style={{ left: `${((idx + 0.5) / values.length) * 100}%` }}>
          <span className="dash-spark-tooltip__k">{MONTHS[idx]}</span>
          <span className="dash-spark-tooltip__v">{label}: {values[idx]}</span>
        </div>
      )}
    </div>
  )
}

// ─── Real-data stat card (replaces hardcoded values) ──────────────────────────
function RealStatCard({ label, value, delta, deltaUp, icon: Icon, cardClass, sparkStroke, sparkLabel, sparkValues }) {
  return (
    <article className={`dash-stat-card ${cardClass} dash-animate`}>
      <div className="dash-stat-card__top">
        <div>
          <p className="dash-stat-card__label">{label}</p>
          <p className="dash-stat-card__value">{value}</p>
          {delta && (
            <p className={`dash-stat-card__delta ${deltaUp ? 'dash-stat-card__delta--up' : 'dash-stat-card__delta--down'}`}>
              {delta}
            </p>
          )}
        </div>
        <div className="dash-stat-card__icon" aria-hidden>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
      <MiniSparkline className="dash-stat-card__spark" stroke={sparkStroke} label={sparkLabel} values={sparkValues} />
    </article>
  )
}

const ACTIVITIES = [
  { icon: PackagePlus,      title: 'New repair assigned',  desc: 'Orders routed to your franchise bench.',            time: 'Live',      tone: 'dash-activity__icon--violet' },
  { icon: Truck,            title: 'Device picked up',     desc: 'Courier OTP verified for inbound diagnostic.',      time: 'Recent',    tone: 'dash-activity__icon--cyan'   },
  { icon: Wrench,           title: 'Repair started',       desc: 'Technician began work on assigned ticket.',         time: 'Today',     tone: 'dash-activity__icon--blue'   },
  { icon: MonitorSmartphone,title: 'Display replaced',     desc: 'OEM panel calibrated · awaiting QC soak.',          time: 'Today',     tone: 'dash-activity__icon--amber'  },
  { icon: CheckCircle2,     title: 'Repair completed',     desc: 'QC signed off · device bagged for pickup.',         time: 'Today',     tone: 'dash-activity__icon--green'  },
  { icon: Sparkles,         title: 'Delivery assigned',    desc: 'Last-mile partner booked for customer return.',     time: 'Today',     tone: 'dash-activity__icon--slate'  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [perfMode, setPerfMode] = useState('repairs')
  const [donutKey, setDonutKey] = useState(null)
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    getMyStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
  }, [])

  // Real values with fallbacks
  const totalOrders    = stats?.totalOrders    ?? 0
  const pendingOrders  = stats?.pendingOrders  ?? 0
  const inRepair       = stats?.inRepair       ?? 0
  const completedOrders = stats?.completedOrders ?? 0
  const totalRevenue   = stats?.totalRevenue   ?? 0
  const commission     = stats?.commission     ?? 0
  const commissionPct  = stats?.commissionPercent ?? 0
  const franchiseName  = stats?.franchise?.name ?? 'Your Franchise'
  const recentOrders   = stats?.recentOrders   ?? []

  // Build sparkline values ending at current real value
  const buildSpark = (end, base = 0) => {
    if (end === 0) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    return Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(base + ((end - base) * i) / 11)))
  }

  const STATUS_BADGE_COLORS = {
    assigned:  'bg-orange-100 text-orange-700',
    confirmed: 'bg-blue-100 text-blue-700',
    picked:    'bg-cyan-100 text-cyan-700',
    repairing: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    delivered: 'bg-teal-100 text-teal-700',
    cancelled: 'bg-red-100 text-red-700',
    placed:    'bg-slate-100 text-slate-600',
  }

  return (
    <div className="content-shell dash-page">

      {/* ── Franchise header banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 60%, #2563eb 100%)',
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>Welcome back</p>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>{franchiseName}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
            Commission rate: <strong style={{ color: '#fff' }}>{commissionPct}%</strong>
            {totalRevenue > 0 && <> · Earned: <strong style={{ color: '#86efac' }}>₹{commission.toLocaleString('en-IN')}</strong></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/orders')} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', borderRadius: 10, padding: '8px 16px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Package size={15} /> View Orders
          </button>
          <button onClick={() => navigate('/earnings')} style={{
            background: '#fff', border: 'none',
            color: '#1d4ed8', borderRadius: 10, padding: '8px 16px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <IndianRupee size={15} /> Earnings
          </button>
        </div>
      </div>

      {/* ── Stat cards with real data ── */}
      <section className="dash-stats" aria-label="Key statistics">

        <RealStatCard
          label="Total assigned orders"
          value={statsLoading ? '—' : totalOrders}
          delta={totalOrders > 0 ? `${totalOrders} orders assigned` : 'No orders yet'}
          deltaUp={totalOrders > 0}
          icon={Package}
          cardClass="dash-stat-card--orange"
          sparkStroke="#ea580c"
          sparkLabel="Orders"
          sparkValues={buildSpark(totalOrders, Math.max(0, totalOrders - 30))}
        />

        <RealStatCard
          label="Pending / New"
          value={statsLoading ? '—' : pendingOrders}
          delta={pendingOrders > 0 ? 'Awaiting action' : 'All caught up'}
          deltaUp={false}
          icon={Timer}
          cardClass="dash-stat-card--cyan"
          sparkStroke="#0891b2"
          sparkLabel="Pending"
          sparkValues={buildSpark(pendingOrders + 5, pendingOrders + 15).reverse()}
        />

        <RealStatCard
          label="Repair in progress"
          value={statsLoading ? '—' : inRepair}
          delta={inRepair > 0 ? `${inRepair} active on bench` : 'Bench is clear'}
          deltaUp={inRepair > 0}
          icon={Wrench}
          cardClass="dash-stat-card--blue"
          sparkStroke="#2563eb"
          sparkLabel="Repairing"
          sparkValues={buildSpark(inRepair, 0)}
        />

        <RealStatCard
          label="Completed repairs"
          value={statsLoading ? '—' : completedOrders}
          delta={completedOrders > 0 ? `${completedOrders} jobs closed` : 'None completed yet'}
          deltaUp={completedOrders > 0}
          icon={CheckCircle2}
          cardClass="dash-stat-card--lime"
          sparkStroke="#65a30d"
          sparkLabel="Completed"
          sparkValues={buildSpark(completedOrders, Math.max(0, completedOrders - 20))}
        />

      </section>

      {/* ── Revenue quick stats ── */}
      {(totalRevenue > 0 || statsLoading) && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 24,
        }}>
          {[
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Your Commission', value: `₹${commission.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#059669', bg: '#d1fae5' },
            { label: 'Commission Rate', value: `${commissionPct}%`, icon: Package, color: '#0891b2', bg: '#cffafe' },
            { label: 'Avg Order Value', value: totalOrders > 0 ? `₹${Math.round(totalRevenue / totalOrders).toLocaleString('en-IN')}` : '₹0', icon: Package, color: '#d97706', bg: '#fef3c7' },
          ].map(card => {
            const Icon = card.icon
            return (
              <div key={card.label} style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
                padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ width: 40, height: 40, background: card.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={card.color} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{card.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>{statsLoading ? '—' : card.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Performance chart + Donut ── */}
      <section className="dash-mid dash-animate dash-animate--d5" aria-label="Performance and status">
        <div className="dash-mid__main">
          <article className="dash-panel dash-panel--tall">
            <div className="dash-panel__head">
              <div>
                <h2 className="dash-panel__title">Repair Performance Overview</h2>
                <p className="dash-panel__subtitle">Monthly franchise repair performance</p>
              </div>
              <div className="dash-seg" role="group" aria-label="Chart metric">
                {['repairs', 'earnings', 'deliveries'].map(m => (
                  <button key={m} type="button"
                    className={`dash-seg__btn${perfMode === m ? ' dash-seg__btn--active' : ''}`}
                    onClick={() => setPerfMode(m)}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="dash-performance">
              <PerformanceChart key={perfMode} mode={perfMode} />
              <div className="dash-performance__months" aria-hidden>
                {MONTHS.map(m => <span key={m} className="dash-performance__month">{m}</span>)}
              </div>
            </div>
          </article>
        </div>

        <div className="dash-mid__side">
          <article className="dash-panel">
            <h2 className="dash-panel__title">Repair Status</h2>
            <p className="dash-panel__subtitle">Share of open and closed tickets</p>
            <div className="dash-donut-row dash-donut-row--chart" onMouseLeave={() => setDonutKey(null)}>
              <RepairStatusDonut activeKey={donutKey} setActiveKey={setDonutKey} total={totalOrders || 0} />
              <ul className="dash-donut__legend">
                {DONUT_SEGMENTS.map(s => (
                  <li key={s.key}
                    className={`dash-donut__legend-item${donutKey === s.key ? ' dash-donut__legend-item--active' : ''}`}
                    onMouseEnter={() => setDonutKey(s.key)}>
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
              {[
                { name: 'Monthly repair target', pct: Math.min(100, totalOrders > 0 ? Math.round((completedOrders / Math.max(totalOrders, 1)) * 100) : 0), cls: 'blue' },
                { name: 'Delivery success rate', pct: 92, cls: 'cyan' },
                { name: 'Customer satisfaction', pct: 94, cls: 'violet' },
              ].map(g => (
                <div key={g.name} className="dash-goal">
                  <div className="dash-goal__row">
                    <span className="dash-goal__name">{g.name}</span>
                    <span className="dash-goal__pct">{g.pct}%</span>
                  </div>
                  <div className="dash-goal__track">
                    <div className={`dash-goal__fill dash-goal__fill--${g.cls}`} style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* ── Recent Orders + Activity ── */}
      <section className="dash-bottom dash-animate dash-animate--d6" aria-label="Orders and activity">
        <article className="dash-panel dash-panel--table">
          <div className="dash-panel__head dash-panel__head--tight">
            <div>
              <h2 className="dash-panel__title">Recent Repair Orders</h2>
              <p className="dash-panel__subtitle">
                {recentOrders.length > 0 ? `Latest ${recentOrders.length} assigned orders` : 'No orders assigned yet'}
              </p>
            </div>
            <button onClick={() => navigate('/orders')} style={{
              background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#475569',
              cursor: 'pointer',
            }}>
              View All
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              {statsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading orders...
                </div>
              ) : (
                <>
                  <Package size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ fontSize: 14 }}>No orders assigned yet</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Ask admin to assign orders to your franchise</p>
                </>
              )}
            </div>
          ) : (
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
                    <th>Status</th>
                    <th className="dash-table__th-num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o._id} style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/repair?orderId=${o._id}`)}>
                      <td>
                        <div className="dash-customer">
                          <span className="dash-customer__avatar" aria-hidden>
                            {o.customer?.name?.charAt(0)?.toUpperCase() ?? 'C'}
                          </span>
                          <span className="dash-customer__meta">
                            <span className="dash-customer__name">{o.customer?.name ?? '—'}</span>
                            <span className="dash-customer__email">{o.customer?.phone ?? '—'}</span>
                          </span>
                        </div>
                      </td>
                      <td><span className="dash-table__mono">{o.orderNumber}</span></td>
                      <td>{o.deviceDetails?.model ?? '—'}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', padding: '2px 10px',
                          borderRadius: 999, fontSize: 11, fontWeight: 600,
                          textTransform: 'capitalize',
                          ...(o.status === 'completed' ? { background: '#dcfce7', color: '#15803d' } :
                              o.status === 'repairing' ? { background: '#fef9c3', color: '#854d0e' } :
                              o.status === 'cancelled' ? { background: '#fee2e2', color: '#b91c1c' } :
                              { background: '#dbeafe', color: '#1d4ed8' }),
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td className="dash-table__num">₹{Number(o.price ?? 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="dash-panel dash-panel--activity">
          <h2 className="dash-panel__title">Recent Repair Activity</h2>
          <p className="dash-panel__subtitle">Live events from your franchise queue</p>
          <ul className="dash-activity">
            {ACTIVITIES.map(a => {
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