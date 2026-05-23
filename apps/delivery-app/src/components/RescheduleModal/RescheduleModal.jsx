import { useState } from 'react'
import { Calendar, Clock, PhoneOff, X } from 'lucide-react'
import './RescheduleModal.css'

export default function RescheduleModal({ task, onClose, onConfirm }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('Customer not answering phone')

  function handleSubmit(e) {
    e.preventDefault()
    if (!date || !time) return
    onConfirm({ date, time, reason })
  }

  return (
    <div className="rs-overlay" role="dialog" aria-modal="true">
      <div className="rs-modal">
        <div className="rs-modal-head">
          <div>
            <h2 className="rs-title">Reschedule Task</h2>
            <p className="rs-sub">{task?.id} · {task?.customer}</p>
          </div>
          <button type="button" className="rs-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="rs-hint">
          <PhoneOff size={16} />
          Customer phone not reachable? Set a new date & time for this delivery.
        </div>

        <form className="rs-form" onSubmit={handleSubmit}>
          <label className="rs-label">
            <Calendar size={14} /> New date
            <input type="date" className="rs-input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="rs-label">
            <Clock size={14} /> New time
            <input type="time" className="rs-input" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>
          <label className="rs-label">
            Reason
            <textarea
              className="rs-textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <div className="rs-actions">
            <button type="button" className="rs-btn rs-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="rs-btn rs-btn-primary">Confirm Reschedule</button>
          </div>
        </form>
      </div>
    </div>
  )
}
