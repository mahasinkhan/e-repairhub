import { useMemo, useState } from 'react'
import {
  MdClose,
  MdInventory2,
  MdLocalShipping,
  MdPlace,
  MdSchedule,
  MdSearch,
  MdCheckCircle,
} from 'react-icons/md'
import '../Dashboard/Dashboard.css'
import './PickupTasks.css'

const AGENT = {
  zone: 'Delhi NCR – Zone 4',
  id: 'AGT-00412',
}

const dummyTasks = [
  {
    id: 'ORD-4821',
    customer: 'Arjun Mehta',
    phone: '+91 98201 34567',
    address: '42, Shanti Nagar, Sector 14, Gurugram, HR 122001',
    device: 'MacBook Pro 14"',
    pickupTime: 'Today, 10:30 AM',
    status: 'Pending',
  },
  {
    id: 'ORD-4822',
    customer: 'Priya Sharma',
    phone: '+91 91234 56789',
    address: '7B, Andheri West, Mumbai, MH 400058',
    device: 'iPhone 15 Pro',
    pickupTime: 'Today, 11:00 AM',
    status: 'Picked',
  },
  {
    id: 'ORD-4823',
    customer: 'Rahul Verma',
    phone: '+91 87654 32100',
    address: '15, Koramangala 4th Block, Bengaluru, KA 560034',
    device: 'Samsung Galaxy S24',
    pickupTime: 'Today, 12:15 PM',
    status: 'Completed',
  },
  {
    id: 'ORD-4824',
    customer: 'Sneha Pillai',
    phone: '+91 99001 77654',
    address: '33, T. Nagar, Chennai, TN 600017',
    device: 'Dell XPS 15',
    pickupTime: 'Today, 01:00 PM',
    status: 'Pending',
  },
  {
    id: 'ORD-4825',
    customer: 'Karan Bhatia',
    phone: '+91 70001 23456',
    address: 'Plot 9, Banjara Hills, Hyderabad, TS 500034',
    device: 'iPad Air 5',
    pickupTime: 'Today, 02:30 PM',
    status: 'Picked',
  },
  {
    id: 'ORD-4826',
    customer: 'Anjali Nair',
    phone: '+91 82345 09876',
    address: '12, Salt Lake City Sector 5, Kolkata, WB 700091',
    device: 'OnePlus 12',
    pickupTime: 'Today, 03:00 PM',
    status: 'Completed',
  },
  {
    id: 'ORD-4827',
    customer: 'Vikram Singh',
    phone: '+91 95432 11223',
    address: '88, Civil Lines, Jaipur, RJ 302006',
    device: 'Lenovo ThinkPad X1',
    pickupTime: 'Today, 04:00 PM',
    status: 'Pending',
  },
  {
    id: 'ORD-4828',
    customer: 'Meera Iyer',
    phone: '+91 77654 98012',
    address: '5, Ashram Road, Ahmedabad, GJ 380009',
    device: 'Sony WH-1000XM5',
    pickupTime: 'Today, 04:45 PM',
    status: 'Pending',
  },
  {
    id: 'ORD-4829',
    customer: 'Rohit Das',
    phone: '+91 63210 45678',
    address: '21, MG Road, Pune, MH 411001',
    device: 'Apple Watch Ultra',
    pickupTime: 'Today, 05:30 PM',
    status: 'Picked',
  },
  {
    id: 'ORD-4830',
    customer: 'Divya Kapoor',
    phone: '+91 98765 43210',
    address: '66, Rajouri Garden, New Delhi, DL 110027',
    device: 'Xiaomi 14 Ultra',
    pickupTime: 'Today, 06:00 PM',
    status: 'Completed',
  },
]

const STAT_ROWS = [
  { key: 'total', label: 'Total pick-ups', sub: "Today's queue", gradient: 'grad-blue', Icon: MdLocalShipping },
  { key: 'pending', label: 'Pending', sub: 'Awaiting agent', gradient: 'grad-orange', Icon: MdSchedule },
  { key: 'picked', label: 'In transit', sub: 'Picked / en route', gradient: 'grad-purple', Icon: MdInventory2 },
  { key: 'completed', label: 'Completed', sub: 'Closed today', gradient: 'grad-green', Icon: MdCheckCircle },
]

function StatusBadge({ status }) {
  const map = {
    Pending: 'badge-pending',
    Picked: 'badge-picked',
    Completed: 'badge-delivered',
  }
  return <span className={`badge ${map[status] || ''}`}>{status}</span>
}

function TaskCard({ task, onAction }) {
  return (
    <div className="pt-card">
      <div className="pt-card__header">
        <div className="pt-card__idrow">
          <span className="order-id">{task.id}</span>
          <StatusBadge status={task.status} />
        </div>
        <span className="pt-card__time">
          <MdSchedule className="pt-inline-ico" aria-hidden />
          {task.pickupTime}
        </span>
      </div>

      <div className="pt-card__body">
        <div className="pt-info-grid">
          <div className="pt-info-item">
            <span className="pt-info-label">Customer</span>
            <span className="pt-info-value">{task.customer}</span>
          </div>
          <div className="pt-info-item">
            <span className="pt-info-label">Phone</span>
            <span className="pt-info-value">{task.phone}</span>
          </div>
          <div className="pt-info-item pt-info-item--full">
            <span className="pt-info-label">
              <MdPlace className="pt-inline-ico" aria-hidden /> Pickup address
            </span>
            <span className="pt-info-value pt-info-value--muted">{task.address}</span>
          </div>
          <div className="pt-info-item">
            <span className="pt-info-label">Device</span>
            <span className="device-chip">{task.device}</span>
          </div>
        </div>
      </div>

      <div className="pt-card__footer">
        <button type="button" className="act-btn act-view" onClick={() => onAction('view', task)}>
          View
        </button>
        {task.status === 'Pending' && (
          <button type="button" className="act-btn act-start" onClick={() => onAction('start', task)}>
            Start pickup
          </button>
        )}
        {task.status === 'Picked' && (
          <button type="button" className="act-btn act-start" onClick={() => onAction('complete', task)}>
            Mark complete
          </button>
        )}
        {task.status === 'Completed' && (
          <button type="button" className="act-btn act-view" disabled>
            Done
          </button>
        )}
      </div>
    </div>
  )
}

function Modal({ task, onClose }) {
  if (!task) return null
  return (
    <div className="pt-modal-overlay" onClick={onClose} role="presentation">
      <div className="pt-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="pt-modal-close" onClick={onClose} aria-label="Close">
          <MdClose />
        </button>
        <h2 className="pt-modal-title">Order details</h2>
        <div className="order-id pt-modal-id">{task.id}</div>
        <div className="pt-modal-grid">
          {[
            ['Customer', task.customer],
            ['Phone', task.phone],
            ['Device', task.device],
            ['Pickup time', task.pickupTime],
            ['Address', task.address],
          ].map(([label, value]) => (
            <div key={label} className={`pt-modal-field ${label === 'Address' ? 'pt-modal-field--full' : ''}`}>
              <span className="pt-modal-label">{label}</span>
              <span className="pt-modal-value">{value}</span>
            </div>
          ))}
          <div className="pt-modal-field">
            <span className="pt-modal-label">Status</span>
            <StatusBadge status={task.status} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PickupTasks() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [tasks, setTasks] = useState(dummyTasks)
  const [selectedTask, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const handleAction = (type, task) => {
    if (type === 'view') {
      setSelected(task)
      return
    }
    if (type === 'start') {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'Picked' } : t)))
      showToast(`Pickup started for ${task.id}`)
    }
    if (type === 'complete') {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'Completed' } : t)))
      showToast(`${task.id} marked complete`)
    }
  }

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchFilter = filter === 'All' || t.status === filter
      const q = search.toLowerCase()
      const matchSearch =
        t.id.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.device.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q) ||
        t.phone.includes(q)
      return matchFilter && matchSearch
    })
  }, [tasks, search, filter])

  const todayCount = tasks.length
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length
  const pickedCount = tasks.filter((t) => t.status === 'Picked').length
  const completedCount = tasks.filter((t) => t.status === 'Completed').length

  const statValues = { total: todayCount, pending: pendingCount, picked: pickedCount, completed: completedCount }

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
            {STAT_ROWS.map((row) => (
              <div key={row.key} className={`stat-card ${row.gradient}`}>
                <div className="stat-top">
                  <div className="stat-info">
                    <p className="stat-label">{row.label}</p>
                    <h2 className="stat-value">{statValues[row.key]}</h2>
                    <p className="stat-sub">{row.sub}</p>
                  </div>
                  <div className="stat-icon-wrap" aria-hidden>
                    <row.Icon className="stat-svg" />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="pickup-toolbar">
            <div className="pickup-toolbar__search">
              <span className="pickup-toolbar__searchIcon" aria-hidden>
                <MdSearch />
              </span>
              <input
                className="pickup-toolbar__input"
                type="search"
                placeholder="Search order, customer, device, address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search ? (
                <button type="button" className="pickup-toolbar__clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <MdClose />
                </button>
              ) : null}
            </div>
            <div className="pickup-toolbar__filter">
              <label htmlFor="pickup-filter">Filter</label>
              <select id="pickup-filter" className="pickup-toolbar__select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                {['All', 'Pending', 'Picked', 'Completed'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <span className="pickup-toolbar__count">
              {filtered.length} task{filtered.length !== 1 ? 's' : ''}
            </span>
          </section>

          <section className="tasks-section">
            <div className="tasks-header">
              <h3 className="section-title">Pickup queue</h3>
            </div>
            <div className="pickup-grid">
              {filtered.length === 0 ? (
                <div className="pickup-empty">
                  <MdInventory2 className="pickup-empty__icon" aria-hidden />
                  <p>No tasks match your filters.</p>
                </div>
              ) : (
                filtered.map((task) => <TaskCard key={task.id} task={task} onAction={handleAction} />)
              )}
            </div>
          </section>

          <Modal task={selectedTask} onClose={() => setSelected(null)} />
          {toast ? <div className="pt-toast">{toast}</div> : null}
        </div>
      </div>
    </div>
  )
}
