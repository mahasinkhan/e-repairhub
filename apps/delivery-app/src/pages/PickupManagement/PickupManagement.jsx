import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  User,
  Phone,
  MapPin,
  Wrench,
  Hash,
  Calendar,
  ShieldCheck,
  PackageCheck,
  Truck,
  Info,
} from 'lucide-react'
import OtpVerification from '../OtpVerification/OtpVerification.jsx'
import './PickupManagement.css'

/* ─────────────────────────────────────────────────
   DUMMY DATA  — replace with API calls
───────────────────────────────────────────────── */
export const PICKUP_TASKS = [
  {
    id: '#ERH258',  customer: 'Rohit Sharma',   phone: '9878563210', address: '24, MG Road, Indore',          device: 'Screen Replacement', status: 'Reached Customer',     time: '9:25 AM',  date: '21 May 2026', notes: 'Customer is at home. Ring doorbell twice.',     altPhone: '9812345678', landmark: 'Near Big Bazaar',
  },
  {
    id: '#ERH259',  customer: 'Neha Verma',     phone: '9654321098', address: '50, Vijay Nagar, Indore',       device: 'Battery Replacement',status: 'Pending',              time: '10:00 AM', date: '21 May 2026', notes: '',                                             altPhone: '',           landmark: 'Opp. D-Mart',
  },
  {
    id: '#ERH260',  customer: 'Amit Patel',     phone: '7654321098', address: '78, Palasia, Indore',           device: 'iPhone 13 Repair',  status: 'Picked',               time: '1:30 PM',  date: '21 May 2026', notes: 'Handle with care.',                            altPhone: '9900112233', landmark: 'Palasia Square',
  },
  {
    id: '#ERH261',  customer: 'Pooja Singh',    phone: '8543210987', address: '12, Rajwada, Indore',           device: 'Laptop Screen',     status: 'Delivered to Franchise',time: '2:00 PM', date: '21 May 2026', notes: '',                                             altPhone: '',           landmark: 'Rajwada Chowk',
  },
  {
    id: '#ERH262',  customer: 'Vikas Mehta',    phone: '5432109876', address: '33, Bhawarkuan, Indore',        device: 'Samsung S22 Repair',status: 'Pending',              time: '3:00 PM',  date: '21 May 2026', notes: 'Call before pickup.',                          altPhone: '',           landmark: 'Bhawarkuan Sq.',
  },
  {
    id: '#ERH263',  customer: 'Sunil Yadav',    phone: '4321098765', address: '9, Sudama Nagar, Indore',       device: 'iPad Screen',       status: 'Reached Customer',     time: '4:00 PM',  date: '21 May 2026', notes: '',                                             altPhone: '9123456789', landmark: 'Near Post Office',
  },
  {
    id: '#ERH264',  customer: 'Kavya Reddy',    phone: '9123456780', address: '45, AB Road, Indore',           device: 'OnePlus Repair',    status: 'Picked',               time: '10:30 AM', date: '21 May 2026', notes: '',                                             altPhone: '',           landmark: 'AB Road Signal',
  },
  {
    id: '#ERH265',  customer: 'Arjun Tiwari',   phone: '8012345678', address: '7, Race Course, Indore',        device: 'MacBook Keyboard',  status: 'Delivered to Franchise',time: '11:45 AM',date: '21 May 2026', notes: 'Delivered successfully.',                      altPhone: '',           landmark: 'Race Course Rd.',
  },
  {
    id: '#ERH266',  customer: 'Sneha Kapoor',   phone: '7890123456', address: '22, Scheme 54, Indore',         device: 'Realme Charging',   status: 'Pending',              time: '2:00 PM',  date: '21 May 2026', notes: '',                                             altPhone: '',           landmark: 'Scheme 54 Main',
  },
  {
    id: '#ERH267',  customer: 'Deepak Joshi',   phone: '6789012345', address: '18, Bhanwarkuan, Indore',       device: 'Pixel 6 Screen',    status: 'Delivered to Franchise',time: '4:30 PM', date: '21 May 2026', notes: '',                                             altPhone: '',           landmark: 'Bhanwarkuan Bridge',
  },
  {
    id: '#ERH268',  customer: 'Priya Malhotra', phone: '5678901234', address: '66, Geeta Bhawan, Indore',      device: 'Vivo Battery',      status: 'Pending',              time: '9:00 AM',  date: '21 May 2026', notes: 'Preferred: morning slot.',                     altPhone: '',           landmark: 'Near Temple',
  },
  {
    id: '#ERH269',  customer: 'Raj Kumar',      phone: '4567890123', address: '3, Manik Bagh, Indore',         device: 'Redmi 11 Glass',    status: 'Pending',              time: '12:00 PM', date: '21 May 2026', notes: '',                                             altPhone: '',           landmark: 'Manik Bagh Palace',
  },
]

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'reached',   label: 'Reached' },
  { key: 'picked',    label: 'Picked' },
  { key: 'franchise', label: 'Delivered to Franchise' },
]

const PAGE_SIZE = 7

/* ─────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────── */
function filterList(list, tab) {
  if (tab === 'reached')   return list.filter(t => t.status === 'Reached Customer')
  if (tab === 'picked')    return list.filter(t => t.status === 'Picked')
  if (tab === 'franchise') return list.filter(t => t.status === 'Delivered to Franchise')
  return list
}

function tabCount(list, key) {
  if (key === 'all')       return list.length
  if (key === 'reached')   return list.filter(t => t.status === 'Reached Customer').length
  if (key === 'picked')    return list.filter(t => t.status === 'Picked').length
  if (key === 'franchise') return list.filter(t => t.status === 'Delivered to Franchise').length
  return 0
}

/* ─────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────── */
const STATUS_MAP = {
  'Pending':               { cls: 'pm-s-pending',   label: 'Pending' },
  'Reached Customer':      { cls: 'pm-s-reached',   label: 'Reached Customer' },
  'Picked':                { cls: 'pm-s-picked',    label: 'Picked' },
  'Delivered to Franchise':{ cls: 'pm-s-franchise', label: 'Delivered to Franchise' },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { cls: '', label: status }
  return <span className={`pm-status-badge ${s.cls}`}>{s.label}</span>
}

/* ─────────────────────────────────────────────────
   CUSTOMER DETAIL MODAL
───────────────────────────────────────────────── */
function CustomerModal({ task, onClose, onVerifyOtp }) {
  return (
    <div className="pm-modal-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Customer Details">

        {/* Header */}
        <div className="pm-modal-header">
          <div className="pm-modal-title-wrap">
            <div className="pm-modal-avatar">{task.customer.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
            <div>
              <h2 className="pm-modal-title">Customer Details</h2>
              <p className="pm-modal-subtitle">Pickup Order — {task.id}</p>
            </div>
          </div>
          <button type="button" className="pm-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Status */}
        <div className="pm-modal-status-row">
          <StatusBadge status={task.status} />
          <span className="pm-modal-time">
            <Calendar size={13} /> {task.date} · {task.time}
          </span>
        </div>

        {/* Info grid */}
        <div className="pm-modal-grid">
          <div className="pm-modal-field">
            <span className="pm-modal-label"><User size={13} /> Customer Name</span>
            <span className="pm-modal-val">{task.customer}</span>
          </div>
          <div className="pm-modal-field">
            <span className="pm-modal-label"><Phone size={13} /> Phone</span>
            <span className="pm-modal-val">{task.phone}</span>
          </div>
          {task.altPhone && (
            <div className="pm-modal-field">
              <span className="pm-modal-label"><Phone size={13} /> Alt. Phone</span>
              <span className="pm-modal-val">{task.altPhone}</span>
            </div>
          )}
          <div className="pm-modal-field pm-modal-field-full">
            <span className="pm-modal-label"><MapPin size={13} /> Pickup Address</span>
            <span className="pm-modal-val">{task.address}</span>
          </div>
          {task.landmark && (
            <div className="pm-modal-field">
              <span className="pm-modal-label"><Info size={13} /> Landmark</span>
              <span className="pm-modal-val">{task.landmark}</span>
            </div>
          )}
          <div className="pm-modal-field">
            <span className="pm-modal-label"><Wrench size={13} /> Device / Issue</span>
            <span className="pm-modal-val">{task.device}</span>
          </div>
          <div className="pm-modal-field">
            <span className="pm-modal-label"><Hash size={13} /> Order ID</span>
            <span className="pm-modal-val pm-modal-order-id">{task.id}</span>
          </div>
        </div>

        {/* Notes */}
        {task.notes && (
          <div className="pm-modal-notes">
            <span className="pm-modal-label"><Info size={13} /> Notes</span>
            <p className="pm-modal-notes-text">{task.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pm-modal-actions">
          <button type="button" className="pm-modal-btn pm-modal-btn-cancel" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="pm-modal-btn pm-modal-btn-verify"
            onClick={() => onVerifyOtp(task)}
          >
            <ShieldCheck size={15} />
            Verify Name &amp; OTP
          </button>
        </div>

      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────────── */
function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="pm-pagination">
      <button type="button" className="pg-btn pg-arrow" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></button>
      {pages.map(p => (
        <button key={p} type="button" className={`pg-btn${p === page ? ' pg-active' : ''}`} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button type="button" className="pg-btn pg-arrow" disabled={page === totalPages} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></button>
    </div>
  )
}

/* ─────────────────────────────────────────────────
   PICKUP MANAGEMENT PAGE
───────────────────────────────────────────────── */
export default function PickupManagement() {
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage]           = useState(1)
  const [modal, setModal]         = useState(null)   // task object or null
  const [otpTask, setOtpTask]     = useState(null)   // task for OTP screen

  const filtered  = useMemo(() => filterList(PICKUP_TASKS, activeTab), [activeTab])
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  function handleTab(key) { setActiveTab(key); setPage(1) }
  function openModal(task) { setModal(task) }
  function closeModal() { setModal(null) }
  function handleVerifyOtp(task) { closeModal(); setOtpTask(task) }
  function backFromOtp() { setOtpTask(null) }

  /* ── OTP screen ── */
  if (otpTask) {
    return (
      <OtpVerification
        task={otpTask}
        flowType="pickup"
        onBack={backFromOtp}
        onComplete={backFromOtp}
      />
    )
  }

  return (
    <>
      <div className="pm-root">

        {/* PAGE HEADER */}
        <div className="pm-page-header">
          <div>
            <h1 className="pm-page-title">Pickup Management</h1>
            <p className="pm-page-sub">Track all pickup-related tasks</p>
          </div>
          <div className="pm-header-counts">
            <div className="pm-count-chip pm-count-reached">
              <PackageCheck size={14} />
              {tabCount(PICKUP_TASKS, 'reached')} Reached
            </div>
            <div className="pm-count-chip pm-count-picked">
              <Truck size={14} />
              {tabCount(PICKUP_TASKS, 'picked')} Picked
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="pm-tabs-row">
          <div className="pm-tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                className={`pm-tab${activeTab === t.key ? ' pm-tab-active' : ''}`}
                onClick={() => handleTab(t.key)}
              >
                {t.label}
                <span className={`pm-tab-count${activeTab === t.key ? ' pm-tab-count-active' : ''}`}>
                  {tabCount(PICKUP_TASKS, t.key)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="pm-card">
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="pm-empty">No pickup tasks found.</td></tr>
                ) : (
                  paginated.map(t => (
                    <tr
                      key={t.id}
                      className="pm-row pm-row-clickable"
                      onClick={() => openModal(t)}
                    >
                      <td><span className="pm-order-id">{t.id}</span></td>
                      <td className="pm-customer">{t.customer}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="pm-time">{t.time}</td>
                      <td>
                        <button
                          type="button"
                          className="pm-view-btn"
                          onClick={e => { e.stopPropagation(); openModal(t) }}
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

      {/* CUSTOMER DETAIL MODAL */}
      {modal && (
        <CustomerModal
          task={modal}
          onClose={closeModal}
          onVerifyOtp={handleVerifyOtp}
        />
      )}
    </>
  )
}
