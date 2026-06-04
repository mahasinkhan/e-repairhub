import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowLeft, Navigation2, ShieldCheck, CheckCircle2,
  MapPin, Package, Truck, Phone, User, Hash, Wrench,
  CircleDot, Circle, CheckCheck, RefreshCw, Send,
  AlertCircle, XCircle,
} from 'lucide-react'
import { updateTaskStatus } from '../../services/delivery.api.js'
import './TaskDetail.css'

/* ── Real API helper (uses the new GET /delivery/tasks/:id route) ── */
async function fetchTask(taskId) {
  const token = localStorage.getItem('token')
  const base  = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
  const res   = await fetch(`${base}/delivery/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Task not found')
  return data.data
}

/* ─────────────────────────────────────────
   INLINE OTP FLOW — Twilio, no taskStore
───────────────────────────────────────── */
function OtpInput({ value, onChange, disabled }) {
  const refs   = useRef([])
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6)

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return
    const next = [...digits]; next[i] = v.slice(-1)
    onChange(next.join(''))
    if (v && i < 5) refs.current[i + 1]?.focus()
  }
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const handlePaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(p)
    if (p.length === 6) refs.current[5]?.focus()
  }

  return (
    <div className="td-otp-boxes">
      {digits.map((d, i) => (
        <input key={i} ref={el => { refs.current[i] = el }}
          type="text" inputMode="numeric" maxLength={1}
          value={d} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`td-otp-box ${d ? 'td-otp-filled' : ''}`} />
      ))}
    </div>
  )
}

function InlineOtpFlow({ task, onBack, onComplete }) {
  const isPickup  = task.taskType === 'pickup' || task.type === 'Pickup'
  const phone     = task.order?.customer?.phone ?? task.phone
  const alreadyIn = task.status === 'in_progress' || task.status === 'In Progress'

  const [step,    setStep]    = useState(alreadyIn ? 'enter-otp' : 'ready')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [resend,  setResend]  = useState(alreadyIn ? 30 : 0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (resend > 0) {
      timerRef.current = setTimeout(() => setResend(r => r - 1), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [resend])

  const handleStart = async () => {
    setLoading(true); setError('')
    try {
      await updateTaskStatus(task._id, 'in_progress')
      setStep('enter-otp')
      setResend(60)
    } catch (e) { setError(e.message || 'Failed to start task') }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resend > 0) return
    setLoading(true); setError('')
    try {
      await updateTaskStatus(task._id, 'in_progress')
      setResend(60); setOtp('')
    } catch (e) { setError(e.message || 'Failed to resend') }
    finally { setLoading(false) }
  }

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Enter the full 6-digit OTP'); return }
    setLoading(true); setError('')
    try {
      const updated = await updateTaskStatus(task._id, 'completed', undefined, otp)
      onComplete(updated)
    } catch (e) {
      setError(e.message || 'OTP verification failed')
      setOtp('')
    } finally { setLoading(false) }
  }

  return (
    <div className="td-otp-flow">
      <button className="td-back-btn" onClick={onBack}>
        <ArrowLeft size={15} /> Back to Task
      </button>

      {step === 'ready' && (
        <div className="td-otp-card">
          <div className="td-otp-icon-wrap td-otp-orange"><Send size={22} /></div>
          <h3 className="td-otp-heading">Start & Notify Customer</h3>
          <p className="td-otp-desc">
            This will mark the task as <strong>In Progress</strong> and send a
            one-time code to the customer via Twilio SMS.
          </p>
          <div className="td-otp-phone-row">
            <Phone size={14} />
            OTP will be sent to <strong>{phone?.slice(0, 4)}****{phone?.slice(-2)}</strong>
          </div>
          {error && <div className="td-otp-msg td-otp-err"><AlertCircle size={14} />{error}</div>}
          <button className="td-otp-action-btn" onClick={handleStart} disabled={loading}>
            {loading ? <RefreshCw size={14} className="td-spin" /> : <Send size={14} />}
            {loading ? 'Starting…' : 'Start Task & Send OTP'}
          </button>
        </div>
      )}

      {step === 'enter-otp' && (
        <div className="td-otp-card">
          <div className="td-otp-icon-wrap td-otp-purple"><ShieldCheck size={22} /></div>
          <h3 className="td-otp-heading">Enter Customer OTP</h3>
          <p className="td-otp-desc">
            A 6-digit code was sent to the customer via SMS. Ask them for it and enter below.
          </p>
          <div className="td-otp-sent-row">
            <CheckCircle2 size={13} />
            OTP sent to {phone?.slice(0, 4)}****{phone?.slice(-2)}
          </div>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <div className="td-otp-resend-row">
            {resend > 0
              ? <span className="td-otp-timer">Resend in {resend}s</span>
              : <button className="td-otp-resend" onClick={handleResend} disabled={loading}>
                  <RefreshCw size={11} /> Resend OTP
                </button>
            }
          </div>
          {error && <div className="td-otp-msg td-otp-err"><AlertCircle size={14} />{error}</div>}
          <button className="td-otp-action-btn" onClick={handleVerify}
            disabled={loading || otp.length !== 6}>
            {loading ? <RefreshCw size={14} className="td-spin" /> : <ShieldCheck size={14} />}
            {loading ? 'Verifying…' : `Verify OTP & Complete ${isPickup ? 'Pickup' : 'Delivery'}`}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Step helpers ── */
const STEPS = ['Assigned', 'Accepted', 'In Progress', 'Completed']
const STATUS_ORDER = ['pending', 'accepted', 'in_progress', 'completed']

function stepIndex(status) {
  if (!status) return 0
  const s = status.toLowerCase().replace(' ', '_')
  const i = STATUS_ORDER.indexOf(s)
  return i >= 0 ? i : 0
}

function StepIcon({ done, active }) {
  if (done)   return <CheckCircle2 size={18} className="step-icon step-done" />
  if (active) return <CircleDot    size={18} className="step-icon step-active" />
  return              <Circle      size={18} className="step-icon step-idle" />
}

function TypeBadge({ type }) {
  const isPickup = type === 'Pickup' || type === 'pickup'
  return (
    <span className={`td-type-badge ${isPickup ? 'td-type-pickup' : 'td-type-delivery'}`}>
      {isPickup ? <Package size={12} /> : <Truck size={12} />}
      {isPickup ? 'Pickup' : 'Delivery'}
    </span>
  )
}

function StatusBadge({ status }) {
  const cls = {
    pending: 'td-status-pending',
    accepted: 'td-status-progress',
    in_progress: 'td-status-progress',
    completed: 'td-status-completed',
    failed: 'td-status-cancelled',
    rescheduled: 'td-status-rescheduled',
  }
  const label = status?.replace('_', ' ')
  return <span className={`td-status-badge ${cls[status?.toLowerCase()] || ''}`}>{label}</span>
}

/* ─────────────────────────────────────────
   MAIN COMPONENT — real API only
───────────────────────────────────────── */
export default function TaskDetail({ task: initialTask, onBack }) {
  const [task,     setTask]    = useState(initialTask)
  const [showOtp,  setShowOtp] = useState(false)
  const [loading,  setLoading] = useState(false)
  const [failOpen, setFailOpen]= useState(false)
  const [failText, setFailText]= useState('')
  const [error,    setError]   = useState('')

  /* Refresh task from real API */
  const refresh = useCallback(async () => {
    if (!initialTask?._id) return
    try {
      const fresh = await fetchTask(initialTask._id)
      if (fresh) setTask(fresh)
    } catch (e) { console.warn('[TaskDetail] refresh failed:', e.message) }
  }, [initialTask?._id])

  /* Refresh whenever OTP flow closes */
  const handleOtpComplete = useCallback((updated) => {
    if (updated) setTask(updated)
    setShowOtp(false)
  }, [])

  /* Accept task */
  const handleAccept = async () => {
    setLoading(true); setError('')
    try {
      const updated = await updateTaskStatus(task._id, 'accepted')
      if (updated) setTask(updated)
      await refresh()
    } catch (e) { setError(e.message || 'Failed to accept task') }
    finally { setLoading(false) }
  }

  /* Fail task */
  const handleFail = async () => {
    if (!failText.trim()) { setError('Enter a reason'); return }
    setLoading(true); setError('')
    try {
      await updateTaskStatus(task._id, 'failed', failText)
      setFailOpen(false)
      await refresh()
      onBack?.()
    } catch (e) { setError(e.message || 'Failed') }
    finally { setLoading(false) }
  }

  /* Show OTP flow when task is selected */
  if (showOtp) {
    return (
      <div className="td-root">
        <InlineOtpFlow
          task={task}
          onBack={() => setShowOtp(false)}
          onComplete={handleOtpComplete}
        />
      </div>
    )
  }

  const curStep   = stepIndex(task?.status)
  const isPickup  = task?.taskType === 'pickup'  || task?.type === 'Pickup'
  const isDelivery= task?.taskType === 'delivery'|| task?.type === 'Delivery'
  const canOtp    = ['accepted', 'in_progress'].includes(task?.status)
  const isDone    = task?.status === 'completed'
  const order     = task?.order

  return (
    <div className="td-root">
      <div className="td-topbar">
        <button type="button" className="td-back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Tasks
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className="td-refresh-icon" onClick={refresh} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <StatusBadge status={task?.status} />
        </div>
      </div>

      <h1 className="td-title">Task Details</h1>

      {/* Completed chip */}
      {isDone && (
        <div className="td-info-chip">
          ✅ {isPickup ? 'Device picked up successfully' : 'Delivered to customer'}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="td-otp-msg td-otp-err" style={{ borderRadius:10, padding:'10px 14px' }}>
          <AlertCircle size={14} />{error}
          <button onClick={() => setError('')} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'inherit' }}>✕</button>
        </div>
      )}

      {/* Info cards */}
      <div className="td-info-row">
        <div className="td-card">
          <h3 className="td-card-title">Order Information</h3>
          <div className="td-info-grid">
            <div className="td-info-item">
              <span className="td-info-label"><Hash size={13} /> Order ID</span>
              <span className="td-info-val td-order-id">{order?.orderNumber ?? task?.id}</span>
            </div>
            <div className="td-info-item">
              <span className="td-info-label"><Truck size={13} /> Type</span>
              <TypeBadge type={task?.taskType ?? task?.type} />
            </div>
            <div className="td-info-item">
              <span className="td-info-label"><Wrench size={13} /> Device</span>
              <span className="td-info-val">
                {order?.deviceDetails?.brand} {order?.deviceDetails?.model} {task?.device}
              </span>
            </div>
            <div className="td-info-item">
              <span className="td-info-label"><Phone size={13} /> Phone</span>
              <span className="td-info-val">{order?.customer?.phone ?? task?.phone ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="td-card">
          <h3 className="td-card-title">Customer Information</h3>
          <div className="td-info-grid">
            <div className="td-info-item">
              <span className="td-info-label"><User size={13} /> Customer Name</span>
              <span className="td-info-val">{order?.customer?.name ?? task?.customer ?? '—'}</span>
            </div>
            <div className="td-info-item">
              <span className="td-info-label"><MapPin size={13} /> Address</span>
              <span className="td-info-val">{order?.customer?.address ?? task?.address ?? '—'}</span>
            </div>
            {(order?.serviceType || task?.device) && (
              <div className="td-info-item">
                <span className="td-info-label"><Wrench size={13} /> Service</span>
                <span className="td-info-val">{order?.serviceType ?? task?.device}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status stepper */}
      <div className="td-card td-status-card">
        <h3 className="td-card-title">Task Progress</h3>
        <div className="td-steps">
          {STEPS.map((s, i) => {
            const done   = i < curStep
            const active = i === curStep
            return (
              <div key={s} className="td-step">
                <div className="td-step-left">
                  <StepIcon done={done} active={active} />
                  {i < STEPS.length - 1 && (
                    <div className={`td-step-line${done ? ' step-line-done' : ''}`} />
                  )}
                </div>
                <div className="td-step-right">
                  <span className={`td-step-label${active ? ' td-step-active-label' : done ? ' td-step-done-label' : ''}`}>
                    {s}
                  </span>
                  {done   && <span className="td-step-sub">Completed</span>}
                  {active && <span className="td-step-sub td-step-sub-active">In progress</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="td-card td-actions-card">
        <h3 className="td-card-title">Actions</h3>
        <div className="td-actions">

          {/* Navigate */}
          {(order?.customer?.address || task?.address) && (
            <button type="button" className="td-action-btn td-action-nav"
              onClick={() => window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order?.customer?.address ?? task?.address)}`,
                '_blank'
              )}>
              <Navigation2 size={16} /> Open Navigation
            </button>
          )}

          {/* Accept (pending → accepted) */}
          {task?.status === 'pending' && (
            <button type="button" className="td-action-btn td-action-otp"
              onClick={handleAccept} disabled={loading}>
              {loading ? <RefreshCw size={16} className="td-spin" /> : <CheckCheck size={16} />}
              {loading ? 'Accepting…' : 'Accept Task'}
            </button>
          )}

          {/* OTP + complete (accepted / in_progress) */}
          {canOtp && (
            <button type="button" className="td-action-btn td-action-otp"
              onClick={() => setShowOtp(true)}>
              <ShieldCheck size={16} />
              {task?.status === 'in_progress' ? 'Enter OTP & Complete' : 'Start & Send OTP'}
            </button>
          )}

          {/* Done state */}
          {isDone && (
            <button type="button" className="td-action-btn td-action-delivered" disabled>
              <CheckCheck size={16} />
              {isPickup ? 'Pickup Completed' : 'Delivered'}
            </button>
          )}

          {/* Fail (accepted / in_progress only) */}
          {canOtp && !failOpen && (
            <button type="button"
              style={{ background:'#FEF2F2', color:'#B91C1C', border:'1px solid #FECACA', borderRadius:10, padding:'10px 16px', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}
              onClick={() => setFailOpen(true)}>
              <XCircle size={15} /> Report Failure
            </button>
          )}

          {/* Fail form */}
          {failOpen && (
            <div style={{ background:'#FEF2F2', border:'1.5px solid #FECACA', borderRadius:12, padding:16 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#B91C1C', margin:'0 0 10px' }}>
                Reason for failure
              </p>
              <textarea value={failText} onChange={e => setFailText(e.target.value)} rows={3}
                placeholder="e.g. Customer not available, wrong address…"
                style={{ width:'100%', border:'1px solid #FECACA', borderRadius:8, padding:'9px 12px', fontSize:13, outline:'none', resize:'none', boxSizing:'border-box', marginBottom:10, fontFamily:'inherit' }} />
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setFailOpen(false)}
                  style={{ flex:1, padding:'9px', border:'1px solid #E2E8F0', borderRadius:9, background:'#fff', color:'#64748B', fontWeight:600, cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleFail} disabled={loading}
                  style={{ flex:1, padding:'9px', border:'none', borderRadius:9, background:'#EF4444', color:'#fff', fontWeight:700, cursor:'pointer' }}>
                  {loading ? 'Submitting…' : 'Confirm Failure'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}