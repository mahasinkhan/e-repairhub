import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Wrench,
  IndianRupee,
  Bell,
  Truck,
  BarChart3,
  User,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import '../../styles/sidebar.css'

const NAV = [
  { to: '.', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: 'orders', label: 'Orders', icon: Package },
  { to: 'repair', label: 'Repair', icon: Wrench },
  { to: 'earnings', label: 'Earnings', icon: IndianRupee },
  { to: 'notifications', label: 'Notifications', icon: Bell },
  { to: 'delivery', label: 'Delivery', icon: Truck },
  { to: 'reports', label: 'Reports', icon: BarChart3 },
  { to: 'profile', label: 'Profile', icon: User },
  { to: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const navigate = useNavigate()

  const handleLogout = () => {
    if (!window.confirm('Sign out of the franchise panel?')) return
    onCloseMobile?.()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="sidebar__backdrop"
          aria-label="Close menu"
          onClick={onCloseMobile}
        />
      ) : null}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo" aria-hidden>
            <Wrench size={22} />
          </div>
          <div className="sidebar__brand-text">
            <div className="sidebar__title">E-RepairHub</div>
            <div className="sidebar__subtitle">Franchise Panel</div>
          </div>
        </div>

        <button
          type="button"
          className="sidebar__toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          <span className="sidebar__toggle-label">
            {collapsed ? 'Expand' : 'Collapse'}
          </span>
        </button>

        <nav className="sidebar__scroll" aria-label="Main">
          <div className="sidebar__nav">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => onCloseMobile?.()}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                }
              >
                <Icon className="sidebar__icon" aria-hidden />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar__logout">
          <button
            type="button"
            className="sidebar__link"
            onClick={handleLogout}
            style={{ width: '100%' }}
          >
            <LogOut className="sidebar__icon" aria-hidden />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
