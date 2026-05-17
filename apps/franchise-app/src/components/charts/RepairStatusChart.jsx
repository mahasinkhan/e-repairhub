const SEGMENTS = [
  { label: 'Completed', pct: 52, color: '#22c55e' },
  { label: 'In progress', pct: 28, color: '#3b82f6' },
  { label: 'Pending intake', pct: 14, color: '#eab308' },
  { label: 'Cancelled', pct: 6, color: '#ef4444' },
]

export default function RepairStatusChart() {
  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Repair status overview</h3>
      <div className="donut-wrap">
        <div className="donut-visual" aria-hidden>
          <div className="donut-hole" />
        </div>
        <div className="donut-legend">
          {SEGMENTS.map((s) => (
            <div key={s.label} className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: s.color }}
              />
              <span>
                {s.label}: <strong>{s.pct}%</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mini-stat" style={{ marginTop: '0.75rem' }}>
        Based on assigned tickets in the last 30 days for your franchise zone.
      </p>
    </div>
  )
}
