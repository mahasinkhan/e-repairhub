import MonthlyBarChart from '../components/charts/MonthlyBarChart'
import ReportsSparkline from '../components/charts/ReportsSparkline'
import RepairStatusChart from '../components/charts/RepairStatusChart'
import '../styles/reports.css'
import '../styles/dashboard.css'
import '../styles/charts.css'
import '../styles/orders.css'

const SUMMARY = [
  { metric: 'First-time fix rate', val: '94.2%', delta: '+1.1 pts' },
  { metric: 'Avg. turnaround', val: '31.4h', delta: '−3.2h' },
  { metric: 'NPS (rolling)', val: '58', delta: '+4' },
  { metric: 'Rework rate', val: '2.1%', delta: '−0.4 pts' },
]

export default function Reports() {
  return (
    <div className="content-shell">
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 className="page-title">Reports</h2>
        <p className="page-subtitle">
          Operational analytics for your franchise — export-ready for audits and reviews.
        </p>
      </header>

      <div className="reports-kpi">
        {SUMMARY.map((s) => (
          <div key={s.metric} className="dashboard-card">
            <p className="dashboard-card__label">{s.metric}</p>
            <p className="dashboard-card__value" style={{ fontSize: '1.5rem' }}>
              {s.val}
            </p>
            <p className="dashboard-card__hint">{s.delta} vs prior period</p>
          </div>
        ))}
      </div>

      <div className="reports-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ReportsSparkline />
          <MonthlyBarChart title="Revenue vs. repair mix" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <RepairStatusChart />
          <div className="orders-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Tickets</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Mobile / tablet</td>
                  <td>118</td>
                  <td>46%</td>
                </tr>
                <tr>
                  <td>Laptops &amp; ultrabooks</td>
                  <td>72</td>
                  <td>28%</td>
                </tr>
                <tr>
                  <td>Desktop / AIO</td>
                  <td>31</td>
                  <td>12%</td>
                </tr>
                <tr>
                  <td>Wearables / audio</td>
                  <td>36</td>
                  <td>14%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
