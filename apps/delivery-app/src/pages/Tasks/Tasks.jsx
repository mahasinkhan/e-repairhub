import { useState, useMemo, useEffect } from 'react'
import { getTasks, subscribeTasks } from '../../services/taskStore.js'
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  PackageSearch,
  Truck,
} from 'lucide-react'
import TaskDetail from './TaskDetail.jsx'
import './Tasks.css'

/* ─────────────────────────────────────────
   DUMMY DATA  — replace with API calls
─────────────────────────────────────────── */
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pickup', label: 'Pickup' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'pending', label: 'Pending' },
  { key: 'rescheduled', label: 'Rescheduled' },
  { key: 'completed', label: 'Completed' },
]

const PAGE_SIZE = 7

/* ─────────────────────────────────────────
   HELPERS
─────────────────────────────────────────── */
function filterTasks(tasks, tab, query) {
  let filtered = tasks
  if (tab === 'pickup')    filtered = filtered.filter(t => t.type === 'Pickup')
  if (tab === 'delivery')  filtered = filtered.filter(t => t.type === 'Delivery')
  if (tab === 'pending')   filtered = filtered.filter(t => t.status === 'Pending')
  if (tab === 'rescheduled') filtered = filtered.filter(t => t.status === 'Rescheduled')
  if (tab === 'completed') filtered = filtered.filter(t => t.status === 'Completed')
  if (query.trim()) {
    const q = query.toLowerCase()
    filtered = filtered.filter(t =>
      t.id.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.phone.includes(q)
    )
  }
  return filtered
}

function tabCount(tasks, key) {
  if (key === 'all')       return tasks.length
  if (key === 'pickup')    return tasks.filter(t => t.type === 'Pickup').length
  if (key === 'delivery')  return tasks.filter(t => t.type === 'Delivery').length
  if (key === 'pending')   return tasks.filter(t => t.status === 'Pending').length
  if (key === 'rescheduled') return tasks.filter(t => t.status === 'Rescheduled').length
  if (key === 'completed') return tasks.filter(t => t.status === 'Completed').length
  return 0
}

/* ─────────────────────────────────────────
   BADGES
─────────────────────────────────────────── */
function TypeBadge({ type }) {
  return (
    <span className={`tsk-type-badge ${type === 'Pickup' ? 'type-pickup' : 'type-delivery'}`}>
      {type === 'Pickup' ? <PackageSearch size={11} /> : <Truck size={11} />}
      {type}
    </span>
  )
}

function StatusBadge({ status }) {
  const cls = {
    Pending: 'status-pending',
    'In Progress': 'status-progress',
    Completed: 'status-completed',
    Rescheduled: 'status-rescheduled',
    Cancelled: 'status-cancelled',
  }
  return <span className={`tsk-status-badge ${cls[status] || ''}`}>{status}</span>
}

/* ─────────────────────────────────────────
   PAGINATION
─────────────────────────────────────────── */
function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null
  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)
  return (
    <div className="tsk-pagination">
      <button type="button" className="pg-btn pg-arrow" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button key={p} type="button" className={`pg-btn${p === page ? ' pg-active' : ''}`} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      <button type="button" className="pg-btn pg-arrow" disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────
   TASKS PAGE
─────────────────────────────────────────── */
export default function Tasks() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [allTasks, setAllTasks] = useState(() => getTasks())

  useEffect(() => subscribeTasks(setAllTasks), [])

  const filtered = useMemo(
    () => filterTasks(allTasks, activeTab, searchQuery),
    [allTasks, activeTab, searchQuery]
  )
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  function handleTab(key) {
    setActiveTab(key)
    setPage(1)
  }
  function handleSearch(e) {
    setSearch(e.target.value)
    setPage(1)
  }
  function openDetail(task) {
    setSelected(task)
  }
  function closeDetail() {
    setSelected(null)
    setAllTasks(getTasks())
  }

  if (selected) {
    return <TaskDetail task={selected} onBack={closeDetail} />
  }

  /* ── List view ── */
  return (
    <div className="tsk-root">

      {/* PAGE HEADER */}
      <div className="tsk-page-header">
        <div>
          <h1 className="tsk-page-title">All Tasks</h1>
          <p className="tsk-page-sub">Manage all your delivery and pickup tasks</p>
        </div>
      </div>

      {/* TABS + FILTER */}
      <div className="tsk-toolbar">
        <div className="tsk-tabs">
          {TABS.map(t => (
            <button key={t.key} type="button" className={`tsk-tab${activeTab === t.key ? ' tsk-tab-active' : ''}`} onClick={() => handleTab(t.key)}>
              {t.label}
              <span className={`tsk-tab-count${activeTab === t.key ? ' tsk-tab-count-active' : ''}`}>
                {tabCount(allTasks, t.key)}
              </span>
            </button>
          ))}
        </div>
        <button type="button" className="tsk-filter-btn">
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      {/* SEARCH */}
      <div className="tsk-search-wrap">
        <Search size={16} className="tsk-search-icon" />
        <input type="text" className="tsk-search" placeholder="Search by Order ID, Name or Phone" value={searchQuery} onChange={handleSearch} />
      </div>

      {/* TABLE */}
      <div className="tsk-card">
        <div className="tsk-table-wrap">
          <table className="tsk-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Pickup Address</th>
                <th>Type</th>
                <th>Status</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="tsk-empty">No tasks found.</td></tr>
              ) : (
                paginated.map(t => (
                  <tr
                    key={t.id}
                    className="tsk-row tsk-row-clickable"
                    onClick={() => openDetail(t)}
                  >
                    <td><span className="tsk-order-id">{t.id}</span></td>
                    <td className="tsk-customer">{t.customer}</td>
                    <td className="tsk-phone">{t.phone}</td>
                    <td className="tsk-address">{t.address}</td>
                    <td><TypeBadge type={t.type} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="tsk-time">
                      {t.status === 'Rescheduled' && t.rescheduleDate
                        ? `${t.rescheduleDate} ${t.rescheduleTime || ''}`
                        : t.time}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="tsk-view-btn"
                        onClick={e => { e.stopPropagation(); openDetail(t) }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

    </div>
  )
}
