import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Timer, Wrench, CheckCircle2,
  PackagePlus, Truck, MonitorSmartphone, Sparkles,
  RefreshCw, TrendingUp, IndianRupee, Calendar,
  XCircle,
} from 'lucide-react'
import { getMyStats, getMyMonthlyStats } from '../services/franchise.api.js'
import '../styles/dashboard.css'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const RANGE_OPTIONS = [
  { label: 'Today',         value: 'today'   },
  { label: 'This Week',     value: 'week'    },
  { label: 'This Month',    value: 'month'   },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'Custom',        value: 'custom'  },
]

function getDateParams(range, customFrom, customTo) {
  const now = new Date()
  switch (range) {
    case 'today': {
      const from = new Date(now); from.setHours(0,0,0,0)
      return { from: from.toISOString(), to: now.toISOString() }
    }
    case 'week': {
      const from = new Date(now); from.setDate(from.getDate() - 7)
      return { from: from.toISOString(), to: now.toISOString() }
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: from.toISOString(), to: now.toISOString() }
    }
    case '3months': {
      const from = new Date(now); from.setMonth(from.getMonth() - 3)
      return { from: from.toISOString(), to: now.toISOString() }
    }
    case 'custom':
      if (customFrom && customTo)
        return { from: new Date(customFrom).toISOString(), to: new Date(customTo + 'T23:59:59').toISOString() }
      return {}
    default:
      return {}
  }
}

function timeAgo(time) {
  if (!time) return '—'
  const diff = Math.floor((Date.now() - new Date(time).getTime()) / 1000)
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

// ── Donut helpers ─────────────────────────────────────────────────────────────
function polar(cx, cy, r, a) { return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) } }
function donutWedgePath(cx, cy, innerR, outerR, a0, a1) {
  const largeArc = a1 - a0 > Math.PI ? 1 : 0
  const p1 = polar(cx, cy, outerR, a0), p2 = polar(cx, cy, outerR, a1)
  const p3 = polar(cx, cy, innerR, a1), p4 = polar(cx, cy, innerR, a0)
  return `M ${p1.x} ${p1.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`
}
function buildSlices(segments) {
  let angle = -Math.PI / 2
  return segments.map((seg, index) => {
    const pct   = Math.max(seg.pct, 0.5) // min 0.5% to keep segment visible
    const sweep = (pct / 100) * 2 * Math.PI
    const a0 = angle, a1 = angle + sweep
    angle = a1
    return { ...seg, index, d: donutWedgePath(100, 100, 44, 72, a0, a1) }
  })
}

function RepairStatusDonut({ activeKey, setActiveKey, total, segments }) {
  const slices = useMemo(() => buildSlices(segments), [segments])
  const tip = useMemo(() => {
    if (!activeKey) return null
    const seg = segments.find(s => s.key === activeKey)
    if (!seg) return null
    return { title: seg.label, pct: seg.pct, count: Math.round((total * seg.pct) / 100) }
  }, [activeKey, total, segments])

  return (
    <div className={`dash-donut dash-donut--svg${activeKey ? ' dash-donut--has-hover' : ''}`}>
      <svg className={`dash-donut-svg${activeKey ? ' dash-donut-svg--dim' : ''}`}
        viewBox="0 0 200 200" role="img" aria-label="Repair status distribution">
        {slices.map(s => (
          <path key={s.key} d={s.d} fill={s.fill}
            className={`dash-donut-svg__path dash-donut-svg__path--i${s.index}${activeKey === s.key ? ' dash-donut-svg__path--active' : ''}`}
            onMouseEnter={() => setActiveKey(s.key)} />
        ))}
      </svg>
      <div className="dash-donut__center">
        <span className="dash-donut__total-label">Total</span>
        <span className="dash-donut__total">{total}</span>
      </div>
      {tip && (
        <div className="dash-donut-floattip" role="status">
          <span className="dash-donut-floattip__k">{tip.title}</span>
          <span className="dash-donut-floattip__v">{tip.pct}% · {tip.count} orders</span>
          <span className="dash-donut-floattip__s">Franchise repair queue</span>
        </div>
      )}
    </div>
  )
}

// ── Performance chart ─────────────────────────────────────────────────────────
function formatPerfTooltip(mode, item) {
  if (!item) return null
  if (mode === 'earnings')   return { line1: item.label, line2: `₹${item.commission.toLocaleString('en-IN')}`, line3: 'Your commission' }
  if (mode === 'deliveries') return { line1: item.label, line2: `${item.deliveries} deliveries`,               line3: 'Completed deliveries' }
  return                             { line1: item.label, line2: `${item.repairs} repairs`,                     line3: 'Monthly repair count' }
}

function PerformanceChart({ mode, monthlyData }) {
  const series = useMemo(() => {
    if (!monthlyData?.series?.length) return [0,0,0,0,0,0,0,0,0,0,0,0]
    return monthlyData.series.map(m =>
      mode === 'earnings'   ? m.commission :
      mode === 'deliveries' ? m.deliveries : m.repairs
    )
  }, [mode, monthlyData])

  const labels = monthlyData?.labels ?? MONTHS
  const svgRef = useRef(null)
  const [hoverIdx, setHoverIdx] = useState(null)

  const geom = useMemo(() => {
    const w = 720, h = 220, pad = 12
    const max = Math.max(...series) || 1
    const min = Math.min(...series)
    const span = max - min || 1
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

  const tip    = hoverIdx !== null ? formatPerfTooltip(mode, monthlyData?.series?.[hoverIdx] ? { ...monthlyData.series[hoverIdx] } : null) : null
  const hx     = hoverIdx !== null ? geom.points[hoverIdx]?.x ?? 0 : 0
  const hy     = hoverIdx !== null ? geom.points[hoverIdx]?.y ?? 0 : 0

  return (
    <div className="dash-performance__chart-wrap dash-chart-entrance">
      <svg ref={svgRef} className="dash-performance__svg dash-performance__svg--interactive"
        viewBox="0 0 720 220" preserveAspectRatio="none"
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
        <div className="dash-performance__tooltip" style={{ left: `${(hx / geom.w) * 100}%` }}>
          <span className="dash-performance__tooltip-k">{tip.line1}</span>
          <span className="dash-performance__tooltip-v">{tip.line2}</span>
          <span className="dash-performance__tooltip-s">{tip.line3}</span>
        </div>
      )}
      <div className="dash-performance__months" aria-hidden>
        {labels.map(m => <span key={m} className="dash-performance__month">{m}</span>)}
      </div>
    </div>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function MiniSparkline({ className, stroke, values, label }) {
  const w = 120, h = 36
  const [idx, setIdx] = useState(null)
  const max = Math.max(...values) || 1, min = Math.min(...values), span = max - min || 1
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
            onMouseEnter={() => setIdx(i)} />
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

function StatCard({ label, value, delta, deltaUp, icon: Icon, cardClass, sparkStroke, sparkLabel, sparkValues }) {
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
        <div className="dash-stat-card__icon" aria-hidden><Icon size={22} strokeWidth={2} /></div>
      </div>
      <MiniSparkline className="dash-stat-card__spark" stroke={sparkStroke} label={sparkLabel} values={sparkValues} />
    </article>
  )
}

// ── Activity icon/label mapping ───────────────────────────────────────────────
const STATUS_ACTIVITY = {
  assigned:  { icon: PackagePlus,  tone: 'dash-activity__icon--violet', title: 'New order assigned'  },
  confirmed: { icon: CheckCircle2, tone: 'dash-activity__icon--green',  title: 'Order confirmed'     },
  picked:    { icon: Truck,        tone: 'dash-activity__icon--cyan',   title: 'Device received'     },
  repairing: { icon: Wrench,       tone: 'dash-activity__icon--blue',   title: 'Repair started'      },
  completed: { icon: MonitorSmartphone, tone: 'dash-activity__icon--amber', title: 'Repair completed'},
  delivered: { icon: Sparkles,     tone: 'dash-activity__icon--slate',  title: 'Order delivered'     },
  cancelled: { icon: XCircle,      tone: 'dash-activity__icon--orange', title: 'Order cancelled'     },
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()

  const [perfMode,    setPerfMode]   = useState('repairs')
  const [donutKey,    setDonutKey]   = useState(null)
  const [stats,       setStats]      = useState(null)
  const [monthlyData, setMonthlyData]= useState(null)
  const [loading,     setLoading]    = useState(true)

  // ── Date range filter ───────────────────────────────────────────────────────
  const [range,      setRange]      = useState('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo,   setCustomTo]   = useState('')

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const params = getDateParams(range, customFrom, customTo)
      const res    = await getMyStats(params)
      setStats(res)
    } catch (e) {
      console.error(e)
      setStats(null)
    } finally { setLoading(false) }
  }, [range, customFrom, customTo])

  const loadMonthly = useCallback(async () => {
    try {
      const res = await getMyMonthlyStats()
      setMonthlyData(res)
    } catch {}
  }, [])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadMonthly() }, [loadMonthly])

  // ── Derived values ──────────────────────────────────────────────────────────
  const totalOrders     = stats?.totalOrders     ?? 0
  const pendingOrders   = stats?.pendingOrders   ?? 0
  const inRepair        = stats?.inRepair        ?? 0
  const completedOrders = stats?.completedOrders ?? 0
  const deliveredOrders = stats?.deliveredOrders ?? 0
  const cancelledOrders = stats?.cancelledOrders ?? 0
  const totalRevenue    = stats?.totalRevenue    ?? 0
  const commission      = stats?.commission      ?? 0
  const franchiseName   = stats?.franchise?.name ?? 'Your Franchise'
  const recentOrders    = stats?.recentOrders    ?? []

  // ── Dynamic donut segments ──────────────────────────────────────────────────
  const donutSegments = useMemo(() => {
    const total = totalOrders || 1
    const segs = [
      { key: 'pending',   label: 'Pending',   pct: Math.round((pendingOrders   / total) * 100), fill: '#eab308', swatch: 'dash-donut__swatch--pending'   },
      { key: 'repairing', label: 'Repairing', pct: Math.round((inRepair        / total) * 100), fill: '#3b82f6', swatch: 'dash-donut__swatch--repairing' },
      { key: 'completed', label: 'Completed', pct: Math.round((completedOrders / total) * 100), fill: '#22c55e', swatch: 'dash-donut__swatch--completed' },
      { key: 'delivered', label: 'Delivered', pct: Math.round((deliveredOrders / total) * 100), fill: '#9333ea', swatch: 'dash-donut__swatch--delivered' },
    ]
    // Normalize to 100%
    const sum = segs.reduce((s, seg) => s + seg.pct, 0)
    if (sum > 0 && sum !== 100) {
      const diff = 100 - sum
      segs[0].pct += diff // add remainder to first segment
    }
    return totalOrders === 0
      ? [
          { key: 'pending',   label: 'Pending',   pct: 25, fill: '#e2e8f0', swatch: 'dash-donut__swatch--pending'   },
          { key: 'repairing', label: 'Repairing', pct: 25, fill: '#cbd5e1', swatch: 'dash-donut__swatch--repairing' },
          { key: 'completed', label: 'Completed', pct: 25, fill: '#94a3b8', swatch: 'dash-donut__swatch--completed' },
          { key: 'delivered', label: 'Delivered', pct: 25, fill: '#64748b', swatch: 'dash-donut__swatch--delivered' },
        ]
      : segs
  }, [totalOrders, pendingOrders, inRepair, completedOrders, deliveredOrders])

  // ── Dynamic activity feed ───────────────────────────────────────────────────
  const activityItems = useMemo(() => {
    if (!recentOrders.length) return []
    return recentOrders.map(o => {
      const cfg = STATUS_ACTIVITY[o.status] ?? STATUS_ACTIVITY.assigned
      return {
        icon:  cfg.icon,
        title: cfg.title,
        desc:  `${o.orderNumber} · ${o.customer?.name ?? '—'} · ${o.deviceDetails?.brand ?? ''} ${o.deviceDetails?.model ?? ''}`,
        time:  timeAgo(o.updatedAt || o.createdAt),
        tone:  cfg.tone,
      }
    })
  }, [recentOrders])

  const buildSpark = (end, base = 0) =>
    Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(base + ((end - base) * i) / 11)))

  return (
    <div className="content-shell dash-page">

      {/* ── Franchise header banner (NO commission rate) ── */}
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
            {totalRevenue > 0 && <>Earned: <strong style={{ color: '#86efac' }}>₹{commission.toLocaleString('en-IN')}</strong> · Revenue: <strong style={{ color: '#fff' }}>₹{totalRevenue.toLocaleString('en-IN')}</strong></>}
            {totalRevenue === 0 && 'Manage your repair orders and track earnings'}
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
            background: '#fff', border: 'none', color: '#1d4ed8',
            borderRadius: 10, padding: '8px 16px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <IndianRupee size={15} /> Earnings
          </button>
        </div>
      </div>

      {/* ── Date range filter ── */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
        padding: '14px 18px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, fontWeight: 600 }}>
            <Calendar size={15} /> Period:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {RANGE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setRange(opt.value)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                background: range === opt.value ? '#1d4ed8' : '#f1f5f9',
                color:      range === opt.value ? '#fff'    : '#64748b',
              }}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={loadStats} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
            border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff',
            fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer',
          }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
        {range === 'custom' && (
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>From:</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                style={{ fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>To:</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                style={{ fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', outline: 'none' }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <section className="dash-stats" aria-label="Key statistics">
        <StatCard label="Total Orders" value={loading ? '—' : totalOrders}
          delta={totalOrders > 0 ? `${totalOrders} orders` : 'No orders'}
          deltaUp={totalOrders > 0} icon={Package} cardClass="dash-stat-card--orange"
          sparkStroke="#ea580c" sparkLabel="Orders" sparkValues={buildSpark(totalOrders, 0)} />
        <StatCard label="Pending / New" value={loading ? '—' : pendingOrders}
          delta={pendingOrders > 0 ? 'Awaiting action' : 'All caught up'}
          deltaUp={false} icon={Timer} cardClass="dash-stat-card--cyan"
          sparkStroke="#0891b2" sparkLabel="Pending" sparkValues={buildSpark(pendingOrders + 3, pendingOrders + 8).reverse()} />
        <StatCard label="Repair in Progress" value={loading ? '—' : inRepair}
          delta={inRepair > 0 ? `${inRepair} on bench` : 'Bench is clear'}
          deltaUp={inRepair > 0} icon={Wrench} cardClass="dash-stat-card--blue"
          sparkStroke="#2563eb" sparkLabel="Repairing" sparkValues={buildSpark(inRepair, 0)} />
        <StatCard label="Completed Repairs" value={loading ? '—' : completedOrders + deliveredOrders}
          delta={completedOrders > 0 ? `${completedOrders} ready · ${deliveredOrders} delivered` : 'None yet'}
          deltaUp={completedOrders > 0} icon={CheckCircle2} cardClass="dash-stat-card--lime"
          sparkStroke="#65a30d" sparkLabel="Completed" sparkValues={buildSpark(completedOrders, 0)} />
      </section>

      {/* ── Revenue strip ── */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Revenue',    value: `₹${totalRevenue.toLocaleString('en-IN')}`,  icon: TrendingUp,  color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Your Earnings',    value: `₹${commission.toLocaleString('en-IN')}`,    icon: IndianRupee, color: '#059669', bg: '#d1fae5' },
            { label: 'Avg Order Value',  value: totalOrders > 0 ? `₹${Math.round(totalRevenue / totalOrders).toLocaleString('en-IN')}` : '₹0', icon: Package, color: '#d97706', bg: '#fef3c7' },
            { label: 'Cancelled',        value: cancelledOrders,                              icon: Package,     color: '#dc2626', bg: '#fee2e2' },
          ].map(card => {
            const Icon = card.icon
            return (
              <div key={card.label} style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <div style={{ width: 38, height: 38, background: card.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={card.color} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{card.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>{card.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Performance chart + Donut ── */}
      <section className="dash-mid dash-animate dash-animate--d5">
        <div className="dash-mid__main">
          <article className="dash-panel dash-panel--tall">
            <div className="dash-panel__head">
              <div>
                <h2 className="dash-panel__title">Performance Overview</h2>
                <p className="dash-panel__subtitle">Monthly franchise data — last 12 months</p>
              </div>
              <div className="dash-seg" role="group">
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
              <PerformanceChart key={perfMode} mode={perfMode} monthlyData={monthlyData} />
            </div>
          </article>
        </div>

        <div className="dash-mid__side">
          <article className="dash-panel">
            <h2 className="dash-panel__title">Repair Status</h2>
            <p className="dash-panel__subtitle">
              {totalOrders > 0 ? 'Live distribution of your orders' : 'No orders in selected period'}
            </p>
            <div className="dash-donut-row dash-donut-row--chart" onMouseLeave={() => setDonutKey(null)}>
              <RepairStatusDonut
                activeKey={donutKey} setActiveKey={setDonutKey}
                total={totalOrders} segments={donutSegments} />
              <ul className="dash-donut__legend">
                {donutSegments.map(s => (
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
            <h2 className="dash-panel__title">Monthly Goals</h2>
            <p className="dash-panel__subtitle">Targets for selected period</p>
            <div className="dash-goals dash-goals--enter">
              {[
                { name: 'Repair completion rate', pct: totalOrders > 0 ? Math.min(100, Math.round(((completedOrders + deliveredOrders) / totalOrders) * 100)) : 0, cls: 'blue'   },
                { name: 'On-time delivery',        pct: deliveredOrders > 0 ? Math.min(100, Math.round((deliveredOrders / Math.max(completedOrders + deliveredOrders, 1)) * 100)) : 0, cls: 'cyan'   },
                { name: 'Order acceptance rate',   pct: totalOrders > 0 ? Math.min(100, Math.round(((totalOrders - cancelledOrders) / totalOrders) * 100)) : 100, cls: 'violet' },
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
      <section className="dash-bottom dash-animate dash-animate--d6">
        <article className="dash-panel dash-panel--table">
          <div className="dash-panel__head dash-panel__head--tight">
            <div>
              <h2 className="dash-panel__title">Recent Orders</h2>
              <p className="dash-panel__subtitle">
                {recentOrders.length > 0 ? `Latest ${recentOrders.length} orders` : 'No orders yet'}
              </p>
            </div>
            <button onClick={() => navigate('/orders')} style={{
              background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer',
            }}>View All</button>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
                </div>
              ) : (
                <>
                  <Package size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ fontSize: 14 }}>No orders assigned yet</p>
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
                          <span className="dash-customer__avatar">
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
                          display: 'inline-flex', padding: '2px 10px', borderRadius: 999,
                          fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                          ...(o.status === 'completed' ? { background: '#dcfce7', color: '#15803d' } :
                              o.status === 'repairing' ? { background: '#fef9c3', color: '#854d0e' } :
                              o.status === 'cancelled' ? { background: '#fee2e2', color: '#b91c1c' } :
                              o.status === 'delivered' ? { background: '#d1fae5', color: '#065f46' } :
                              { background: '#dbeafe', color: '#1d4ed8' }),
                        }}>
                          {o.status === 'completed' ? 'Ready' : o.status}
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
          <h2 className="dash-panel__title">Recent Activity</h2>
          <p className="dash-panel__subtitle">
            {activityItems.length > 0 ? 'Live events from your franchise queue' : 'No recent activity'}
          </p>
          <ul className="dash-activity">
            {activityItems.length === 0 ? (
              <li style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                <RefreshCw size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p style={{ fontSize: 13 }}>No activity yet</p>
              </li>
            ) : activityItems.map((a, i) => {
              const Icon = a.icon
              return (
                <li key={i} className="dash-activity__item dash-animate-row">
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}