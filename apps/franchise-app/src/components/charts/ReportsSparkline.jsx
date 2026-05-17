const POINTS = [12, 18, 14, 22, 28, 24, 32, 30, 38, 42, 40, 48]

export default function ReportsSparkline() {
  const w = 280
  const h = 72
  const max = Math.max(...POINTS)
  const min = Math.min(...POINTS)
  const path = POINTS
    .map((v, i) => {
      const x = (i / (POINTS.length - 1)) * w
      const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Ticket volume (12 weeks)</h3>
      <svg
        width="100%"
        height="80"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L${w},${h} L0,${h} Z`}
          fill="url(#sparkFill)"
        />
        <path
          d={path}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mini-stat">Rolling franchise throughput excluding cancelled jobs.</p>
    </div>
  )
}
