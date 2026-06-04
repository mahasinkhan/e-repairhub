import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  Truck, Package, MapPin, Clock, CheckCircle,
  Search, X, RefreshCw, Shield, Phone, User,
  AlertCircle, Navigation,
} from 'lucide-react'
import { getMyTasks, updateTaskStatus } from '../../services/delivery.api.js'
import './PickupTasks.css'

/* ── Backend → display ── */
const BACKEND_STATUS = {
  pending:     'Pending',
  accepted:    'Accepted',
  in_progress: 'In Progress',
  completed:   'Completed',
  failed:      'Failed',
}

/* ── Status visual config ── */
const STATUS = {
  Pending:     { color: '#92400E', bg: '#FEF3C7', border: '#FCD34D', dot: '#F59E0B' },
  Accepted:    { color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD', dot: '#3B82F6' },
  'In Progress':{ color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA', dot: '#F97316' },
  Completed:   { color: '#15803D', bg: '#DCFCE7', border: '#86EFAC', dot: '#22C55E' },
  Failed:      { color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5', dot: '#EF4444' },
}

/* ── Action config per raw status ── */
const ACTION_CFG = {
  pending:     { label: 'Accept Task',   icon: CheckCircle, next: 'accepted',    cls: 'pt-btn-accept'  },
  accepted:    { label: 'Start Pickup',  icon: Package,     next: 'in_progress', cls: 'pt-btn-start'   },
  in_progress: { label: 'Mark Complete', icon: CheckCircle, next: 'completed',   cls: 'pt-btn-complete'},
}

const FILTERS = ['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Failed']

/* ── Normalise backend task ── */
function normalise(t) {
  const brand = t.order?.deviceDetails?.brand ?? ''
  const model = t.order?.deviceDetails?.model ?? ''
  const sched = t.scheduledTime
    ? new Date(t.scheduledTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—'
  return {
    _id:       t._id,
    id:        t.order?.orderNumber ?? t._id,
    rawStatus: t.status,
    status:    BACKEND_STATUS[t.status] ?? t.status,
    customer:  t.order?.customer?.name    ?? '—',
    phone:     t.order?.customer?.phone   ?? '—',
    address:   t.order?.customer?.address ?? '—',
    device:    [brand, model].filter(Boolean).join(' ') || '—',
    pickupTime:sched,
    otp:       t.otp ?? null,
  }
}

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const st = STATUS[status] ?? { color: '#475569', bg: '#F1F5F9', border: '#CBD5E1', dot: '#94A3B8' }
  return (
    <span className="pt-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
      <span className="pt-badge-dot" style={{ background: st.dot }} />
      {status}
    </span>
  )
}

/* ── Skeleton card ── */
function Skeleton() {
  return (
    <div className="pt-card pt-skeleton">
      <div className="pt-card__header">
        <div className="pt-skel pt-skel-pill" />
        <div className="pt-skel pt-skel-badge" />
      </div>
      <div className="pt-card__body">
        {[1,2,3,4].map(i => (
          <div className="pt-info-row" key={i}>
            <div className="pt-skel pt-skel-icon" />
            <div style={{ flex:1 }}>
              <div className="pt-skel pt-skel-lbl" />
              <div className="pt-skel pt-skel-val" style={{ width: i%2===0?'65%':'50%' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="pt-card__footer">
        <div className="pt-skel pt-skel-btn" />
        <div className="pt-skel pt-skel-btn pt-skel-btn-w" />
      </div>
    </div>
  )
}

/* ── Task Card ── */
function TaskCard({ task, onAction, isActing }) {
  const cfg  = ACTION_CFG[task.rawStatus] ?? null
  const st   = STATUS[task.status]
  const ActionIcon = cfg?.icon

  return (
    <div className="pt-card" style={{ '--st-dot': st?.dot ?? '#e2e8f0' }}>
      <div className="pt-card__header">
        <div className="pt-card__idrow">
          <span className="pt-order-id">{task.id}</span>
          <StatusBadge status={task.status} />
        </div>
        <span className="pt-card__time">
          <Clock size={12} />
          {task.pickupTime}
        </span>
      </div>

      <div className="pt-card__body">
        {[
          { icon: User,    label: 'Customer', value: task.customer },
          { icon: Phone,   label: 'Phone',    value: task.phone    },
          { icon: Package, label: 'Device',   value: task.device   },
          { icon: MapPin,  label: 'Address',  value: task.address  },
        ].map(r => (
          <div className="pt-info-row" key={r.label}>
            <div className="pt-info-icon"><r.icon size={13} /></div>
            <div className="pt-info-text">
              <span className="pt-info-label">{r.label}</span>
              <span className="pt-info-val">{r.value}</span>
            </div>
          </div>
        ))}

        {task.otp && (
          <div className="pt-otp-strip">
            <Shield size={11} />
            OTP: <strong className="pt-otp-code">{task.otp}</strong>
          </div>
        )}
      </div>

      <div className="pt-card__footer">
        <button className="pt-btn pt-btn-ghost" onClick={() => onAction('view', task)}>
          Details
        </button>
        {cfg ? (
          <button
            className={`pt-btn ${cfg.cls}`}
            disabled={isActing}
            onClick={() => onAction('action', task)}
          >
            {isActing
              ? <span className="pt-spinner" />
              : <ActionIcon size={12} />
            }
            {isActing ? 'Updating…' : cfg.label}
          </button>
        ) : task.rawStatus === 'completed' ? (
          <button className="pt-btn pt-btn-done" disabled>
            <CheckCircle size={12} /> Completed
          </button>
        ) : null}
      </div>
    </div>
  )
}

/* ── Details Modal ── */
function Modal({ task, onClose }) {
  if (!task) return null
  const st = STATUS[task.status] ?? {}
  const rows = [
    { icon: User,    label: 'Customer',    value: task.customer  },
    { icon: Phone,   label: 'Phone',       value: task.phone     },
    { icon: Package, label: 'Device',      value: task.device    },
    { icon: Clock,   label: 'Pickup time', value: task.pickupTime},
    { icon: MapPin,  label: 'Address',     value: task.address, full: true },
    ...(task.otp ? [{ icon: Shield, label: 'OTP Code', value: task.otp, mono: true }] : []),
  ]
  return (
    <div className="pt-modal-overlay" onClick={onClose}>
      <div className="pt-modal" onClick={e => e.stopPropagation()}>
        <div className="pt-modal-head">
          <div className="pt-modal-head-left">
            <div className="pt-modal-icon"><Package size={18} /></div>
            <div>
              <h2 className="pt-modal-title">Order Details</h2>
              <p className="pt-modal-sub">{task.id}</p>
            </div>
          </div>
          <button className="pt-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="pt-modal-status-bar">
          <StatusBadge status={task.status} />
          <button className="pt-modal-maps-btn"
            onClick={() => window.open(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`,
              '_blank'
            )}>
            <Navigation size={12} /> Open Maps
          </button>
        </div>

        <div className="pt-modal-body">
          {rows.map(r => (
            <div className={`pt-modal-row ${r.full ? 'pt-modal-row-full' : ''}`} key={r.label}>
              <div className="pt-modal-row-icon"><r.icon size={14} /></div>
              <div>
                <p className="pt-modal-row-label">{r.label}</p>
                <p className={`pt-modal-row-val ${r.mono ? 'pt-mono' : ''}`}>{r.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-modal-foot">
          <button className="pt-btn pt-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ── */
export default function PickupTasks() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } })()

  const [tasks,        setTasks]    = useState([])
  const [loading,      setLoading]  = useState(true)
  const [actionId,     setActionId] = useState(null)
  const [search,       setSearch]   = useState('')
  const [filter,       setFilter]   = useState('All')
  const [selectedTask, setSelected] = useState(null)
  const [toast,        setToast]    = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMyTasks()
      setTasks((data ?? []).filter(t => t.taskType === 'pickup').map(normalise))
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = useCallback(async (type, task) => {
    if (type === 'view') { setSelected(task); return }
    const cfg = ACTION_CFG[task.rawStatus]
    if (!cfg) return
    setActionId(task._id)
    try {
      await updateTaskStatus(task._id, cfg.next)
      await load()
      showToast(`${task.id} → ${BACKEND_STATUS[cfg.next]}`)
    } catch (err) {
      showToast(err.message || 'Update failed', 'error')
    } finally {
      setActionId(null)
    }
  }, [load])

  const filtered = useMemo(() => tasks.filter(t => {
    const matchFilter = filter === 'All' || t.status === filter
    const q = search.toLowerCase()
    const matchSearch =
      t.id.toLowerCase().includes(q)       ||
      t.customer.toLowerCase().includes(q) ||
      t.device.toLowerCase().includes(q)   ||
      t.address.toLowerCase().includes(q)  ||
      t.phone.includes(q)
    return matchFilter && matchSearch
  }), [tasks, search, filter])

  /* Stat counts */
  const counts = {
    total:      tasks.length,
    pending:    tasks.filter(t => t.rawStatus === 'pending').length,
    inProgress: tasks.filter(t => ['accepted','in_progress'].includes(t.rawStatus)).length,
    completed:  tasks.filter(t => t.rawStatus === 'completed').length,
  }

  const filterCounts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'All' ? tasks.length : tasks.filter(t => t.status === f).length
    return acc
  }, {})

  const STATS = [
    { key: 'total',      label: 'Total Pickups',  sub: "Today's queue",   icon: Truck,       cls: 'pt-stat-blue'   },
    { key: 'pending',    label: 'Pending',         sub: 'Awaiting agent',  icon: Clock,       cls: 'pt-stat-amber'  },
    { key: 'inProgress', label: 'In Transit',      sub: 'Picked / en route',icon: Package,   cls: 'pt-stat-purple' },
    { key: 'completed',  label: 'Completed',       sub: 'Closed today',    icon: CheckCircle, cls: 'pt-stat-green'  },
  ]

  return (
    <div className="pt-root">

      {/* ── Agent zone bar ── */}
      {user?.name && (
        <div className="pt-zone-bar">
          <span className="pt-zone-left">
            <MapPin size={13} />
            Zone: <strong>{user.zone ?? 'Unassigned'}</strong>
          </span>
          <span className="pt-zone-right">
            Agent: <strong>{user.name}</strong>
          </span>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="pt-stats-grid">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.key} className={`pt-stat ${s.cls}`}>
              <div className="pt-stat-left">
                <p className="pt-stat-label">{s.label}</p>
                <h2 className="pt-stat-val">{loading ? '—' : counts[s.key]}</h2>
                <p className="pt-stat-sub">{s.sub}</p>
              </div>
              <div className="pt-stat-icon" aria-hidden>
                <Icon size={28} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="pt-toolbar">
        <div className="pt-search-wrap">
          <Search size={14} className="pt-search-ico" />
          <input
            className="pt-search"
            type="text"
            placeholder="Search order, customer, device, address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="pt-search-clear" onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="pt-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`pt-filter-btn ${filter === f ? 'pt-filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <span className="pt-filter-count">{filterCounts[f]}</span>
            </button>
          ))}
        </div>

        <button className="pt-refresh-btn" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'pt-spin' : ''} />
        </button>
      </div>

      {/* ── Results label ── */}
      {!loading && (
        <p className="pt-results-label">
          Showing <strong>{filtered.length}</strong> of {tasks.length} pickup tasks
        </p>
      )}

      {/* ── Cards grid ── */}
      <div className="pt-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="pt-empty">
            <div className="pt-empty-icon"><Package size={28} /></div>
            <p className="pt-empty-title">
              {search ? 'No results found' : 'No pickup tasks'}
            </p>
            <span className="pt-empty-sub">
              {search ? `Nothing matches "${search}"` : 'No pickup tasks assigned right now'}
            </span>
            {(search || filter !== 'All') && (
              <button className="pt-empty-reset"
                onClick={() => { setSearch(''); setFilter('All') }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filtered.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onAction={handleAction}
              isActing={actionId === task._id}
            />
          ))
        )}
      </div>

      {/* ── Modal ── */}
      {selectedTask && <Modal task={selectedTask} onClose={() => setSelected(null)} />}

      {/* ── Toast ── */}
      {toast && (
        <div className={`pt-toast ${toast.type === 'error' ? 'pt-toast-err' : ''}`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}