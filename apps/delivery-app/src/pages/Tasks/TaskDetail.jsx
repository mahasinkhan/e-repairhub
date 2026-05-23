import {
  ArrowLeft,
  Navigation2,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  PackageSearch,
  Truck,
  Phone,
  User,
  Hash,
  Wrench,
  CircleDot,
  Circle,
  CheckCheck,
  CalendarClock,
  PhoneOff,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import OtpVerification from '../OtpVerification/OtpVerification.jsx'
import RescheduleModal from '../../components/RescheduleModal/RescheduleModal.jsx'
import {
  getTaskById,
  subscribeTasks,
  rescheduleTask,
} from '../../services/taskStore.js'
import { addNotification } from '../../services/notificationStore.js'
import './TaskDetail.css'

const STEPS = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'picked', label: 'Picked from Franchise' },
  { key: 'delivery', label: 'Mark as Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

function stepIndex(status) {
  if (status === 'Rescheduled') return 0
  if (status === 'Pending') return 0
  if (status === 'In Progress') return 2
  if (status === 'Completed') return 3
  return 0
}

function StepIcon({ done, active }) {
  if (done) return <CheckCircle2 size={18} className="step-icon step-done" />
  if (active) return <CircleDot size={18} className="step-icon step-active" />
  return <Circle size={18} className="step-icon step-idle" />
}

function TypeBadge({ type }) {
  return (
    <span className={`td-type-badge ${type === 'Pickup' ? 'td-type-pickup' : 'td-type-delivery'}`}>
      {type === 'Pickup' ? <PackageSearch size={12} /> : <Truck size={12} />}
      {type}
    </span>
  )
}

function StatusBadge({ status }) {
  const cls = {
    Pending: 'td-status-pending',
    'In Progress': 'td-status-progress',
    Completed: 'td-status-completed',
    Rescheduled: 'td-status-rescheduled',
    Cancelled: 'td-status-cancelled',
  }
  return <span className={`td-status-badge ${cls[status] || ''}`}>{status}</span>
}

function RouteMap() {
  return (
    <div className="td-map-wrap">
      <iframe
        title="Route Map"
        src="https://www.openstreetmap.org/export/embed.html?bbox=72.57,23.00,72.70,23.08&layer=mapnik&marker=23.0225,72.5714"
        className="td-map-iframe"
        loading="lazy"
      />
      <div className="td-map-pin">
        <MapPin size={13} />
        Gandhinagar, Gujarat
      </div>
    </div>
  )
}

export default function TaskDetail({ task: initialTask, onBack }) {
  const [task, setTask] = useState(() => getTaskById(initialTask.id) || initialTask)
  const [showOtp, setShowOtp] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)

  useEffect(() => {
    return subscribeTasks(() => {
      const fresh = getTaskById(initialTask.id)
      if (fresh) setTask(fresh)
    })
  }, [initialTask.id])

  const curStep = stepIndex(task.status)
  const isDelivery = task.type === 'Delivery'
  const canReschedule = task.status !== 'Completed' && task.status !== 'Cancelled'

  function handleReschedule({ date, time, reason }) {
    const updated = rescheduleTask(task.id, { date, time, reason })
    if (updated) setTask(updated)
    addNotification({
      type: 'task',
      title: 'Task rescheduled',
      description: `${task.id} rescheduled to ${date} at ${time}. Reason: ${reason}`,
      category: 'alerts',
    })
    setShowReschedule(false)
  }

  function handleOtpComplete(updated) {
    if (updated) setTask(updated)
    setShowOtp(false)
  }

  if (showOtp) {
    return (
      <OtpVerification
        task={task}
        flowType={isDelivery ? 'delivery' : 'pickup'}
        onBack={() => setShowOtp(false)}
        onComplete={handleOtpComplete}
      />
    )
  }

  return (
    <div className="td-root">
      {showReschedule && (
        <RescheduleModal
          task={task}
          onClose={() => setShowReschedule(false)}
          onConfirm={handleReschedule}
        />
      )}

      <div className="td-topbar">
        <button type="button" className="td-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Tasks
        </button>
        <StatusBadge status={task.status} />
      </div>

      <h1 className="td-title">Task Details</h1>

      {task.status === 'Rescheduled' && (
        <div className="td-reschedule-banner">
          <CalendarClock size={18} />
          <div>
            <strong>Rescheduled</strong>
            <p>
              New slot: {task.rescheduleDate} at {task.rescheduleTime}
              {task.rescheduleReason ? ` · ${task.rescheduleReason}` : ''}
            </p>
          </div>
        </div>
      )}

      {task.status === 'Completed' && task.paymentMethod && (
        <div className="td-info-chip">
          Paid via {task.paymentMethod === 'cash' ? 'Cash in Hand' : 'QR Scanner'}
        </div>
      )}

      {task.pickupImage && (
        <div className="td-pickup-proof">
          <img src={task.pickupImage} alt="Pickup proof" />
          <span>Pickup proof uploaded</span>
        </div>
      )}

      <div className="td-info-row">
        <div className="td-card">
          <h3 className="td-card-title">Order Information</h3>
          <div className="td-info-grid">
            <div className="td-info-item">
              <span className="td-info-label"><Hash size={13} /> Order ID</span>
              <span className="td-info-val td-order-id">{task.id}</span>
            </div>
            <div className="td-info-item">
              <span className="td-info-label"><Truck size={13} /> Type</span>
              <TypeBadge type={task.type} />
            </div>
            <div className="td-info-item">
              <span className="td-info-label"><Wrench size={13} /> Device</span>
              <span className="td-info-val">{task.device || '—'}</span>
            </div>
            <div className="td-info-item">
              <span className="td-info-label"><Phone size={13} /> Phone</span>
              <span className="td-info-val">{task.phone}</span>
            </div>
          </div>
        </div>

        <div className="td-card">
          <h3 className="td-card-title">Customer Information</h3>
          <div className="td-info-grid">
            <div className="td-info-item">
              <span className="td-info-label"><User size={13} /> Customer Name</span>
              <span className="td-info-val">{task.customer}</span>
            </div>
            <div className="td-info-item">
              <span className="td-info-label"><MapPin size={13} /> Pickup Address</span>
              <span className="td-info-val">{task.address}</span>
            </div>
            <div className="td-info-item">
              <span className="td-info-label"><MapPin size={13} /> Delivery Address</span>
              <span className="td-info-val">{task.deliveryAddress || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="td-card td-instructions-card">
        <h3 className="td-card-title">Special Instructions</h3>
        <p className="td-instructions-text">{task.instructions || '—'}</p>
      </div>

      <div className="td-bottom-row">
        <div className="td-card td-status-card">
          <h3 className="td-card-title">Task Status</h3>
          <div className="td-steps">
            {STEPS.map((s, i) => {
              const done = i < curStep
              const active = i === curStep
              return (
                <div key={s.key} className="td-step">
                  <div className="td-step-left">
                    <StepIcon done={done} active={active} />
                    {i < STEPS.length - 1 && (
                      <div className={`td-step-line${done ? ' step-line-done' : ''}`} />
                    )}
                  </div>
                  <div className="td-step-right">
                    <span className={`td-step-label${active ? ' td-step-active-label' : done ? ' td-step-done-label' : ''}`}>
                      {s.label}
                    </span>
                    {done && <span className="td-step-sub">Completed</span>}
                    {active && <span className="td-step-sub td-step-sub-active">In progress</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="td-card td-actions-card">
          <h3 className="td-card-title">Actions</h3>
          <div className="td-actions">
            <button type="button" className="td-action-btn td-action-nav">
              <Navigation2 size={16} />
              Open Navigation
            </button>
            {canReschedule && isDelivery && (
              <button
                type="button"
                className="td-action-btn td-action-reschedule"
                onClick={() => setShowReschedule(true)}
              >
                <PhoneOff size={16} />
                Customer Not Answering — Reschedule
              </button>
            )}
            {task.status !== 'Completed' && (
              <button
                type="button"
                className="td-action-btn td-action-otp"
                onClick={() => setShowOtp(true)}
              >
                <ShieldCheck size={16} />
                Verify OTP {isDelivery ? '& Complete Delivery' : '& Upload Image'}
              </button>
            )}
            {task.status === 'Completed' && (
              <button type="button" className="td-action-btn td-action-delivered" disabled>
                <CheckCheck size={16} />
                {isDelivery ? 'Delivered' : 'Pickup Done'}
              </button>
            )}
          </div>
        </div>

        <div className="td-card td-map-card">
          <h3 className="td-card-title">Route Map</h3>
          <RouteMap />
        </div>
      </div>
    </div>
  )
}
