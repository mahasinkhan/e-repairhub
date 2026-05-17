const MAP = {
  Pending: 'badge--pending',
  Repairing: 'badge--repairing',
  Completed: 'badge--completed',
  Cancelled: 'badge--cancelled',
  Delivered: 'badge--delivered',
}

export default function StatusBadge({ status }) {
  const key = MAP[status] ? status : 'Pending'
  const cls = MAP[key] || 'badge--info'
  return <span className={`badge ${cls}`}>{key}</span>
}
