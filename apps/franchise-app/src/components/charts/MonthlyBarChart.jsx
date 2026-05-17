const MONTHS = [
  { m: 'Jan', h: 42 },
  { m: 'Feb', h: 55 },
  { m: 'Mar', h: 38 },
  { m: 'Apr', h: 62 },
  { m: 'May', h: 48 },
  { m: 'Jun', h: 71 },
]

export default function MonthlyBarChart({
  title = 'Monthly revenue trend',
  embedded = false,
}) {
  const body = (
    <>
      {!embedded ? <h3 className="chart-card__title">{title}</h3> : null}
      {embedded ? (
        <h4
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          {title}
        </h4>
      ) : null}
      <div className="bar-chart">
        {MONTHS.map(({ m, h }) => (
          <div key={m} className="bar-chart__col">
            <div
              className="bar-chart__bar"
              style={{ height: `${h}%` }}
              title={`${m}: ${h}%`}
            />
            <span className="bar-chart__label">{m}</span>
          </div>
        ))}
      </div>
      <p className="mini-stat" style={{ marginTop: '0.75rem' }}>
        Normalized view of payout-ready jobs vs. baseline target.
      </p>
    </>
  )

  if (embedded) {
    return <div className="chart-card chart-card--embedded">{body}</div>
  }

  return <div className="chart-card">{body}</div>
}
