export default function StatCard({ label, value, hint, icon: Icon, accent }) {
  return (
    <article className="dashboard-card">
      <div className="dashboard-card__head">
        <div>
          <p className="dashboard-card__label">{label}</p>
          <p className="dashboard-card__value">{value}</p>
          {hint ? <p className="dashboard-card__hint">{hint}</p> : null}
        </div>
        {Icon ? (
          <div
            className="stat-card-icon"
            style={
              accent
                ? {
                    background: accent.bg,
                    color: accent.fg,
                  }
                : undefined
            }
          >
            <Icon size={22} strokeWidth={2} />
          </div>
        ) : null}
      </div>
    </article>
  )
}
