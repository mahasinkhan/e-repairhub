import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ShieldCheck, RefreshCw, CheckCircle2, XCircle,
  Banknote, ScanLine, Upload, Image as ImageIcon,
} from 'lucide-react'
import { completeDelivery, completePickup } from '../../services/taskStore.js'
import { addNotification } from '../../services/notificationStore.js'
import './OtpVerification.css'

const DUMMY_OTP = '482731'
const OTP_LENGTH = 6
const RESEND_SECS = 30
const OTP_VALIDITY = 5

function PhoneIllustration({ otp }) {
  return (
    <div className="otp-phone-wrap" aria-hidden>
      <div className="otp-blob otp-blob-1" />
      <div className="otp-blob otp-blob-2" />
      <svg className="otp-phone-svg" viewBox="0 0 100 170" fill="none">
        <rect x="10" y="5" width="80" height="160" rx="14" fill="#1e2a3b" />
        <rect x="14" y="20" width="72" height="118" rx="6" fill="#0f172a" />
        <rect x="38" y="10" width="24" height="4" rx="2" fill="#334155" />
        <rect x="35" y="150" width="30" height="4" rx="2" fill="#334155" />
        <circle cx="72" cy="12" r="5" fill="#ef4444" />
      </svg>
      <div className="otp-card-float">
        <p className="otp-card-label">Your OTP is</p>
        <p className="otp-card-code">{otp}</p>
      </div>
    </div>
  )
}

function SimpleQr({ orderId }) {
  const cells = []
  const seed = (orderId || 'ERH').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const on = (seed + r * 7 + c * 11) % 3 !== 0
      cells.push(
        <div key={`${r}-${c}`} className={`otp-qr-cell${on ? ' on' : ''}`} />
      )
    }
  }
  return (
    <div className="otp-qr-wrap">
      <div className="otp-qr-grid">{cells}</div>
      <p className="otp-qr-label">Scan to confirm · {orderId}</p>
    </div>
  )
}

function useCountdown(initial) {
  const [seconds, setSeconds] = useState(initial)
  const timerRef = useRef(null)
  const start = useCallback((val) => {
    clearInterval(timerRef.current)
    setSeconds(val ?? initial)
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [initial])
  useEffect(() => {
    start()
    return () => clearInterval(timerRef.current)
  }, [start])
  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  return { seconds, fmt, restart: () => start(initial) }
}

/**
 * @param {object} props
 * @param {object} props.task
 * @param {'pickup'|'delivery'} props.flowType
 * @param {() => void} props.onBack
 * @param {(updatedTask) => void} props.onComplete
 */
export default function OtpVerification({ task, flowType = 'delivery', onBack, onComplete }) {
  const phone = task?.phone ?? '9876543211'
  const isDelivery = flowType === 'delivery'

  const [step, setStep] = useState('otp')
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [verifyState, setVerify] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pickupPreview, setPickupPreview] = useState(null)
  const [pickupFileName, setPickupFileName] = useState('')
  const [finishing, setFinishing] = useState(false)
  const inputRefs = useRef([])
  const fileRef = useRef(null)
  const { seconds, fmt, restart } = useCountdown(RESEND_SECS)

  useEffect(() => {
    if (step === 'otp') inputRefs.current[0]?.focus()
  }, [step])

  function handleChange(e, idx) {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = val
    setDigits(next)
    setVerify('idle')
    setErrorMsg('')
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus()
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) inputRefs.current[idx - 1]?.focus()
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = [...digits]
    for (let i = 0; i < OTP_LENGTH; i++) next[i] = pasted[i] ?? ''
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  async function handleVerify() {
    const entered = digits.join('')
    if (entered.length < OTP_LENGTH) {
      setVerify('error')
      setErrorMsg('Please enter all 6 digits.')
      return
    }
    setVerify('loading')
    await new Promise((r) => setTimeout(r, 700))
    if (entered === DUMMY_OTP) {
      setVerify('success')
      setTimeout(() => setStep('post'), 600)
    } else {
      setVerify('error')
      setErrorMsg('Invalid OTP. Please try again.')
    }
  }

  function handleResend() {
    if (seconds > 0) return
    setDigits(Array(OTP_LENGTH).fill(''))
    setVerify('idle')
    setErrorMsg('')
    restart()
    inputRefs.current[0]?.focus()
  }

  function finishDelivery(paymentMethod) {
    if (!task?.id || finishing) return
    setFinishing(true)
    const updated = completeDelivery(task.id, { paymentMethod })
    addNotification({
      type: 'completed',
      title: 'Delivery successful',
      description: `Order ${task.id} delivered via ${paymentMethod === 'cash' ? 'Cash in Hand' : 'QR Scan'}.`,
      category: 'alerts',
    })
    setStep('done')
    setFinishing(false)
    onComplete?.(updated)
  }

  function handlePickupImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPickupFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setPickupPreview(reader.result)
    reader.readAsDataURL(file)
  }

  function finishPickup() {
    if (!task?.id || !pickupPreview || finishing) return
    setFinishing(true)
    const updated = completePickup(task.id, {
      imageDataUrl: pickupPreview,
      imageName: pickupFileName,
    })
    addNotification({
      type: 'pickup',
      title: 'Pickup completed',
      description: `Order ${task.id} — device image uploaded successfully.`,
      category: 'updates',
    })
    setStep('done')
    setFinishing(false)
    onComplete?.(updated)
  }

  const filled = digits.join('').length === OTP_LENGTH

  if (step === 'done') {
    return (
      <div className="otp-root">
        <div className="otp-outer">
          {onBack && (
            <button type="button" className="otp-back-btn" onClick={onBack}>← Back to Task</button>
          )}
          <div className="otp-done-card">
            <CheckCircle2 size={48} className="otp-done-icon" />
            <h2>{isDelivery ? 'Delivered Successfully!' : 'Pickup Completed!'}</h2>
            <p>Order {task?.id} updated everywhere in your tasks.</p>
            <button type="button" className="otp-verify-btn" onClick={onBack}>Back to Task</button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'post') {
    return (
      <div className="otp-root">
        <div className="otp-outer otp-outer-wide">
          {onBack && (
            <button type="button" className="otp-back-btn" onClick={onBack}>← Back to Task</button>
          )}
          <h1 className="otp-page-title">
            {isDelivery ? 'Complete Delivery' : 'Upload Pickup Proof'}
          </h1>
          <p className="otp-subtitle post-sub">
            OTP verified for <strong>{task?.id}</strong>
          </p>

          {isDelivery ? (
            <div className="otp-post-delivery">
              <SimpleQr orderId={task?.id} />
              <p className="otp-post-hint">Ask customer to scan QR or collect cash</p>
              <div className="otp-post-actions">
                <button
                  type="button"
                  className="otp-post-btn otp-post-scan"
                  disabled={finishing}
                  onClick={() => finishDelivery('scan')}
                >
                  <ScanLine size={18} />
                  Scanner Verified
                </button>
                <button
                  type="button"
                  className="otp-post-btn otp-post-cash"
                  disabled={finishing}
                  onClick={() => finishDelivery('cash')}
                >
                  <Banknote size={18} />
                  Cash in Hand
                </button>
              </div>
            </div>
          ) : (
            <div className="otp-post-pickup">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="otp-file-hidden"
                onChange={handlePickupImage}
              />
              {pickupPreview ? (
                <div className="otp-preview-wrap">
                  <img src={pickupPreview} alt="Pickup proof" className="otp-preview-img" />
                  <p className="otp-preview-name">{pickupFileName}</p>
                </div>
              ) : (
                <button
                  type="button"
                  className="otp-upload-zone"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={28} />
                  <span>Tap to upload device image</span>
                  <small>Photo after pickup at customer location</small>
                </button>
              )}
              <button
                type="button"
                className="otp-verify-btn"
                disabled={!pickupPreview || finishing}
                onClick={finishPickup}
              >
                <ImageIcon size={18} />
                Submit Pickup Proof
              </button>
              {pickupPreview && (
                <button
                  type="button"
                  className="otp-change-photo"
                  onClick={() => fileRef.current?.click()}
                >
                  Change photo
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="otp-root">
      <div className="otp-outer">
        {onBack && (
          <button type="button" className="otp-back-btn" onClick={onBack}>← Back to Task</button>
        )}
        <h1 className="otp-page-title">OTP Verification</h1>
        <PhoneIllustration otp={DUMMY_OTP} />
        <p className="otp-subtitle">
          Enter OTP sent to <strong className="otp-phone">{phone}</strong>
        </p>
        <div className="otp-inputs" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              className={`otp-box${verifyState === 'error' ? ' otp-box-error' : ''}${verifyState === 'success' ? ' otp-box-success' : ''}`}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>
        {verifyState === 'error' && (
          <div className="otp-msg otp-msg-error"><XCircle size={15} />{errorMsg}</div>
        )}
        {verifyState === 'success' && (
          <div className="otp-msg otp-msg-success"><CheckCircle2 size={15} />OTP Verified!</div>
        )}
        <div className="otp-resend-row">
          {seconds > 0 ? (
            <span className="otp-resend-timer">Resend OTP in <strong className="otp-countdown">{fmt}</strong></span>
          ) : (
            <button type="button" className="otp-resend-btn" onClick={handleResend}>
              <RefreshCw size={13} /> Resend OTP
            </button>
          )}
        </div>
        <button
          type="button"
          className={`otp-verify-btn${!filled ? ' otp-verify-btn-disabled' : ''}`}
          onClick={handleVerify}
          disabled={!filled || verifyState === 'loading'}
        >
          {verifyState === 'loading' && <span className="otp-spinner" />}
          {verifyState === 'success' ? <><CheckCircle2 size={18} /> Verified!</> : 'Verify OTP'}
        </button>
        <p className="otp-validity">⏱ OTP valid for {OTP_VALIDITY} minutes · Demo OTP: {DUMMY_OTP}</p>
      </div>
    </div>
  )
}
