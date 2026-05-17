import StatusBadge from '../cards/StatusBadge'

const ROWS = [
  {
    id: 'ORD-10482',
    device: 'MacBook Air (M2)',
    customer: 'A. Mehta',
    sla: 'Today · 6 PM',
    status: 'Repairing',
  },
  {
    id: 'ORD-10471',
    device: 'Galaxy S24 Ultra',
    customer: 'R. Kapoor',
    sla: 'Tomorrow',
    status: 'Pending',
  },
  {
    id: 'ORD-10465',
    device: 'Dell XPS 15',
    customer: 'S. Iyer',
    sla: 'Delivered',
    status: 'Completed',
  },
  {
    id: 'ORD-10459',
    device: 'iPhone 14',
    customer: 'N. Joshi',
    sla: '—',
    status: 'Cancelled',
  },
]

export default function RecentOrdersTable({ title = 'Recent assigned orders' }) {
  return (
    <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        className="dashboard-card__head"
        style={{ padding: '1.25rem 1.35rem', marginBottom: 0 }}
      >
        <h3 className="dashboard-section-title" style={{ marginBottom: 0 }}>
          {title}
        </h3>
        <span className="badge badge--info">Live queue</span>
      </div>
      <div className="orders-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Device</th>
              <th>Customer</th>
              <th>SLA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.id}</strong>
                </td>
                <td>{r.device}</td>
                <td>{r.customer}</td>
                <td>{r.sla}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
