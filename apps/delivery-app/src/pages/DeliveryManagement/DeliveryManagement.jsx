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
  Truck,
  PackageCheck,
  CheckCircle2,
  Info,
} from 'lucide-react'
import OtpVerification from '../OtpVerification/OtpVerification.jsx'
import './DeliveryManagement.css'

/* ─────────────────────────────────────────────────
   DUMMY DATA  — replace with API calls
───────────────────────────────────────────────── */
export const DELIVERY_TASKS = [
  {
    id: '#DLV101', customer: 'Amit Patel',     phone: '7654321098', address: '78, Palasia, Indore',           deliveryAddress: 'Tech Hub, Sector 12, Gandhinagar, Gujarat', device: 'iPhone 13 Repair',   status: 'Picked from Franchise', time: '9:00 AM',  date: '21 May 2026', notes: 'Handle with care. Fragile device.',     altPhone: '9900112233', landmark: 'Palasia Square',
  },
  {
    id: '#DLV102', customer: 'Pooja Singh',    phone: '8543210987', address: '12, Rajwada, Indore',           deliveryAddress: '22, Civil Lines, Jaipur, Rajasthan',        device: 'Laptop Screen',      status: 'Out for Delivery',      time: '10:15 AM', date: '21 May 2026', notes: 'Call before arriving.',                 altPhone: '',           landmark: 'Rajwada Chowk',
  },
  {
    id: '#DLV103', customer: 'Sunil Yadav',    phone: '4321098765', address: '9, Sudama Nagar, Indore',       deliveryAddress: '45, Anna Salai, Chennai, TN',               device: 'iPad Screen',        status: 'Delivered',             time: '11:30 AM', date: '21 May 2026', notes: '',                                      altPhone: '9123456789', landmark: 'Near Post Office',
  },
  {
    id: '#DLV104', customer: 'Kavya Reddy',    phone: '9123456780', address: '45, AB Road, Indore',           deliveryAddress: '7, Jubilee Hills, Hyderabad, TS',           device: 'OnePlus Repair',     status: 'Picked from Franchise', time: '12:00 PM', date: '21 May 2026', notes: '',                                      altPhone: '',           landmark: 'AB Road Signal',
  },
  {
    id: '#DLV105', customer: 'Rahul Gupta',    phone: '2345678901', address: '55, LIG Colony, Indore',        deliveryAddress: '77, Vasant Kunj, New Delhi',                device: 'iPhone 12 Camera',   status: 'Out for Delivery',      time: '1:00 PM',  date: '21 May 2026', notes: 'Urgent delivery.',                      altPhone: '',           landmark: 'LIG Main Gate',
  },
  {
    id: '#DLV106', customer: 'Meena Sharma',   phone: '1234567890', address: '11, Sanyogitaganj, Indore',     deliveryAddress: '25, Koregaon Park, Pune, MH',               device: 'Mi TV Repair',       status: 'Delivered',             time: '2:30 PM',  date: '21 May 2026', notes: '',                                      altPhone: '',           landmark: 'Near SBI Bank',
  },
  {
    id: '#DLV107', customer: 'Saurabh Dixit',  phone: '9988776655', address: '30, Khajrana, Indore',          deliveryAddress: '14, Bandra West, Mumbai, MH',               device: 'Oppo Screen',        status: 'Delivered',             time: '3:15 PM',  date: '21 May 2026', notes: 'Delivered to security guard.',          altPhone: '',           landmark: 'Khajrana Temple Road',
  },
  {
    id: '#DLV108', customer: 'Tanvi Jain',     phone: '8877665544', address: '16, Annapurna, Indore',         deliveryAddress: '2, Ashok Nagar, Bhopal, MP',                device: 'Poco Charging Port', status: 'Out for Delivery',      time: '4:00 PM',  date: '21 May 2026', notes: 'Preferred slot: afternoon.',            altPhone: '',           landmark: 'Annapurna Main Road',
  },
  {
    id: '#DLV109', customer: 'Lokesh Verma',   phone: '7766554433', address: '42, South Tukoganj, Indore',    deliveryAddress: '50, Green Park, New Delhi',                 device: 'Nokia Screen',       status: 'Picked from Franchise', time: '5:00 PM',  date: '21 May 2026', notes: '',                                      altPhone: '',           landmark: 'Tukoganj Crossing',
  },
  {
    id: '#DLV110', customer: 'Nisha Patel',    phone: '6655443322', address: '5, Rau, Indore',                deliveryAddress: '21, Vastrapur, Ahmedabad, GJ',              device: 'Tablet Battery',     status: 'Delivered',             time: '5:45 PM',  date: '21 May 2026', notes: '',                                      altPhone: '',           landmark: 'Rau Main Market',
  },
  {
    id: '#DLV111', customer: 'Deepak Joshi',   phone: '6789012345', address: '18, Bhanwarkuan, Indore',       deliveryAddress: '30, FC Road, Pune, MH',                     device: 'Pixel 6 Screen',     status: 'Out for Delivery',      time: '6:30 PM',  date: '21 May 2026', notes: '',                                      altPhone: '',           landmark: 'Bhanwarkuan Bridge',
  },
  {
    id: '#DLV112', customer: 'Priya Malhotra', phone: '5678901234', address: '66, Geeta Bhawan, Indore',      deliveryAddress: '88, DLF Phase 3, Gurgaon, HR',             device: 'Vivo Battery',       status: 'Picked from Franchise', time: '7:00 PM',  date: '21 May 2026', notes: 'Call before reaching.',                 altPhone: '',           landmark: 'Near Temple',
  },
]

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'franchise', label: 'Picked from Franchise' },
  { key: 'out',       label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

const PAGE_SIZE = 7

/* ─────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────── */
function filterList(list, tab) {
  if (tab === 'franchise') return list.filter(t => t.status === 'Picked from Franchise')
  if (tab === 'out')       return list.filter(t => t.status === 'Out for Delivery')
  if (tab === 'delivered') return list.filter(t => t.status === 'Delivered')
  return list
}

function tabCount(list, key) {
  if (key === 'all')       return list.length
  if (key === 'franchise') return list.filter(t => t.status === 'Picked from Franchise').length
  if (key === 'out')       return list.filter(t => t.status === 'Out for Delivery').length
  if (key === 'delivered') return list.filter(t => t.status === 'Delivered').length
  return 0
}

/* ─────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────── */
const STATUS_MAP = {
  'Picked from Franchise': { cls: 'dm-s-franchise', label: 'Picked from Franchise' },
  'Out for Delivery':      { cls: 'dm-s-out',       label: 'Out for Delivery' },
  'Delivered':             { cls: 'dm-s-delivered', label: 'Delivered' },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { cls: '', label: status }
  return <span className={`dm-status-badge ${s.cls}`}>{s.label}</span>
}

/* ─────────────────────────────────────────────────
   CUSTOMER DETAIL MODAL
───────────────────────────────────────────────── */
function CustomerModal({ task, onClose, onVerifyOtp }) {
  const initials = task.customer.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="dm-modal-overlay" onClick={onClose}>
      <div className="dm-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Customer Details">

        {/* Header */}
        <div className="dm-modal-header">
          <div className="dm-modal-title-wrap">
            <div className="dm-modal-avatar">{initials}</div>
            <div>
              <h2 className="dm-modal-title">Customer Details</h2>
              <p className="dm-modal-subtitle">Delivery Order — {task.id}</p>
            </div>
          </div>
          <button type="button" className="dm-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Status row */}
        <div className="dm-modal-status-row">
          <StatusBadge status={task.status} />
          <span className="dm-modal-time">
            <Calendar size={13} /> {task.date} · {task.time}
          </span>
        </div>

        {/* Info grid */}
        <div className="dm-modal-grid">
          <div className="dm-modal-field">
            <span className="dm-modal-label"><User size={13} /> Customer Name</span>
            <span className="dm-modal-val">{task.customer}</span>
          </div>
          <div className="dm-modal-field">
            <span className="dm-modal-label"><Phone size={13} /> Phone</span>
            <span className="dm-modal-val">{task.phone}</span>
          </div>
          {task.altPhone && (
            <div className="dm-modal-field">
              <span className="dm-modal-label"><Phone size={13} /> Alt. Phone</span>
              <span className="dm-modal-val">{task.altPhone}</span>
            </div>
          )}
          <div className="dm-modal-field dm-modal-field-full">
            <span className="dm-modal-label"><MapPin size={13} /> Pickup Address</span>
            <span className="dm-modal-val">{task.address}</span>
          </div>
          <div className="dm-modal-field dm-modal-field-full">
            <span className="dm-modal-label"><MapPin size={13} /> Delivery Address</span>
            <span className="dm-modal-val dm-delivery-addr">{task.deliveryAddress}</span>
          </div>
          {task.landmark && (
            <div className="dm-modal-field">
              <span className="dm-modal-label"><Info size={13} /> Landmark</span>
              <span className="dm-modal-val">{task.landmark}</span>
            </div>
          )}
          <div className="dm-modal-field">
            <span className="dm-modal-label"><Wrench size={13} /> Device / Issue</span>
            <span className="dm-modal-val">{task.device}</span>
          </div>
          <div className="dm-modal-field">
            <span className="dm-modal-label"><Hash size={13} /> Order ID</span>
            <span className="dm-modal-val dm-modal-order-id">{task.id}</span>
          </div>
        </div>

        {/* Notes */}
        {task.notes && (
          <div className="dm-modal-notes">
            <span className="dm-modal-label"><Info size={13} /> Notes</span>
            <p className="dm-modal-notes-text">{task.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="dm-modal-actions">
          <button type="button" className="dm-modal-btn dm-modal-btn-cancel" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="dm-modal-btn dm-modal-btn-verify"
            onClick={() => onVerifyOtp(task)}
          >
            <ShieldCheck size={15} />
            Verify Customer &amp; OTP
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
    <div className="dm-pagination">
      <button type="button" className="dm-pg-btn dm-pg-arrow" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous">
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button key={p} type="button" className={`dm-pg-btn${p === page ? ' dm-pg-active' : ''}`} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      <button type="button" className="dm-pg-btn dm-pg-arrow" disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Next">
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────
   DELIVERY MANAGEMENT PAGE
───────────────────────────────────────────────── */
export default function DeliveryManagement() {
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage]           = useState(1)
  const [modal, setModal]         = useState(null)
  const [otpTask, setOtpTask]     = useState(null)

  const filtered  = useMemo(() => filterList(DELIVERY_TASKS, activeTab), [activeTab])
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  function handleTab(key) { setActiveTab(key); setPage(1) }
  function openModal(task) { setModal(task) }
  function closeModal()    { setModal(null) }
  function handleVerifyOtp(task) { closeModal(); setOtpTask(task) }
  function backFromOtp()   { setOtpTask(null) }

  /* OTP screen */
  if (otpTask) {
    return (
      <OtpVerification
        task={otpTask}
        flowType="delivery"
        onBack={backFromOtp}
        onComplete={backFromOtp}
      />
    )
  }

  return (
    <>
      <div className="dm-root">

        {/* PAGE HEADER */}
        <div className="dm-page-header">
          <div>
            <h1 className="dm-page-title">Delivery Management</h1>
            <p className="dm-page-sub">Track all delivery-related tasks</p>
          </div>
          <div className="dm-header-counts">
            <div className="dm-count-chip dm-count-out">
              <Truck size={14} />
              {tabCount(DELIVERY_TASKS, 'out')} Out for Delivery
            </div>
            <div className="dm-count-chip dm-count-delivered">
              <CheckCircle2 size={14} />
              {tabCount(DELIVERY_TASKS, 'delivered')} Delivered
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="dm-tabs-row">
          <div className="dm-tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                className={`dm-tab${activeTab === t.key ? ' dm-tab-active' : ''}`}
                onClick={() => handleTab(t.key)}
              >
                {t.label}
                <span className={`dm-tab-count${activeTab === t.key ? ' dm-tab-count-active' : ''}`}>
                  {tabCount(DELIVERY_TASKS, t.key)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="dm-card">
          <div className="dm-table-wrap">
            <table className="dm-table">
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
                  <tr><td colSpan={5} className="dm-empty">No delivery tasks found.</td></tr>
                ) : (
                  paginated.map(t => (
                    <tr
                      key={t.id}
                      className="dm-row dm-row-clickable"
                      onClick={() => openModal(t)}
                    >
                      <td><span className="dm-order-id">{t.id}</span></td>
                      <td className="dm-customer">{t.customer}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="dm-time">{t.time}</td>
                      <td>
                        <button
                          type="button"
                          className="dm-view-btn"
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
