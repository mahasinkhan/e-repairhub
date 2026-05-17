import '../styles/profile.css'

export default function Profile() {
  return (
    <div className="content-shell">
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 className="page-title">Profile</h2>
        <p className="page-subtitle">
          Franchise identity, compliance contacts, and public-facing service details.
        </p>
      </header>

      <div className="profile-grid">
        <aside className="profile-aside">
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '1.75rem',
            }}
          >
            NC
          </div>
          <h3 style={{ fontSize: '1.1rem' }}>North City Franchise</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: 6 }}>
            Franchise ID · FR-BLR-NC-014
          </p>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Verified bench · 6 technicians · Tier-2 liquid lab enabled
          </p>
        </aside>

        <section className="profile-form">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Franchise details</h3>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="legal">Legal entity name</label>
              <input id="legal" defaultValue="North City Repairs Pvt. Ltd." />
            </div>
            <div className="form-field">
              <label htmlFor="gst">GSTIN</label>
              <input id="gst" defaultValue="29AABCN1234C1Z5" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="email">Operations email</label>
              <input id="email" type="email" defaultValue="ops@northcityrepairs.example" />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Service hotline</label>
              <input id="phone" type="tel" defaultValue="+91 80 4120 8890" />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="addr">Service address (customer visits)</label>
            <input id="addr" defaultValue="12th Main, Indiranagar, Bengaluru — 560038" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-primary">
              Save changes
            </button>
            <button type="button" className="btn-ghost">
              Discard
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
