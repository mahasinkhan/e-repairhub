import { useState } from 'react'
import '../styles/settings.css'
import '../styles/profile.css'

function ToggleRow({ title, description, initial = false }) {
  const [on, setOn] = useState(initial)
  return (
    <div className="setting-row">
      <div>
        <strong>{title}</strong>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        className={`toggle${on ? ' toggle--on' : ''}`}
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        aria-label={title}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  )
}

export default function Settings() {
  return (
    <div className="content-shell">
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">
          Account preferences, notifications, and security posture for this franchise login.
        </p>
      </header>

      <section className="settings-section">
        <h3>Notifications</h3>
        <p>Choose how your team hears about SLA changes, payouts, and courier exceptions.</p>
        <ToggleRow
          title="Push alerts for SLA breaches"
          description="Instant banner inside the panel when a ticket crosses its promise window."
          initial
        />
        <ToggleRow
          title="Email digest (daily)"
          description="Summarized franchise health snapshot every morning at 7:00 AM IST."
        />
        <ToggleRow
          title="SMS for critical courier failures"
          description="Only for OTP mismatch or three consecutive failed delivery attempts."
        />
      </section>

      <section className="settings-section">
        <h3>Account &amp; security</h3>
        <p>These controls affect how operators authenticate when using shared front-desk devices.</p>
        <ToggleRow
          title="Require PIN re-entry after 10 minutes idle"
          description="Recommended for storefront kiosks with rotating staff."
          initial
        />
        <ToggleRow
          title="Mask customer phone numbers on printouts"
          description="Shows last four digits only on thermal job cards."
        />
      </section>

      <section className="settings-section">
        <h3>Billing &amp; exports</h3>
        <p>Defaults for finance reconciliation with your own accounting stack.</p>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label htmlFor="export">Default export format</label>
          <select id="export" defaultValue="xlsx" style={{ maxWidth: 280 }}>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV</option>
            <option value="zip">ZIP bundle (CSV + PDF)</option>
          </select>
        </div>
      </section>
    </div>
  )
}
