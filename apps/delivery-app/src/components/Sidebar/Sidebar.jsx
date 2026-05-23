import {
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  PackageSearch,
  Truck,
  Bell,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  PanelLeftClose,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import './Sidebar.css'

const NAV = [
  { to: '.',                  label: 'Dashboard',           icon: LayoutDashboard, end: true },
  { to: 'tasks',              label: 'Tasks',               icon: ClipboardList },
  { to: 'otp-verification',   label: 'OTP Verification',    icon: ShieldCheck },
  { to: 'pickup-management',  label: 'Pickup Management',   icon: PackageSearch },
  { to: 'delivery-management',label: 'Delivery Management', icon: Truck },
  { to: 'notifications',      label: 'Notifications',       icon: Bell },
  { to: 'performance-reports',label: 'Performance Reports', icon: BarChart3 },
  { to: 'profile',            label: 'Profile',             icon: UserCircle },
  { to: 'settings',           label: 'Settings',            icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <aside
        className={`dlv-sidebar${isOpen ? ' dlv-sidebarOpen' : ''}`}
        aria-label="Sidebar navigation"
      >
        <div className="dlv-sidebarHeader">
          <div className="dlv-brand">
            <div className="dlv-brandLogo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 7l10 5m0 0l10-5m-10 5v10" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="dlv-brandText">
              <p className="dlv-brandTitle">E-RepairHub</p>
              <p className="dlv-brandSub">Delivery Panel</p>
            </div>
          </div>
          <button
            type="button"
            className="dlv-closeBtn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="dlv-closeBtnIcon" />
          </button>
        </div>

        <nav className="dlv-nav" aria-label="Main navigation">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `dlv-navItem${isActive ? ' dlv-navItemActive' : ''}`
              }
            >
              <span className="dlv-navIconWrap">
                <Icon className="dlv-navIcon" aria-hidden />
              </span>
              <span className="dlv-navLabel">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dlv-sidebarFooter">
          <button type="button" onClick={logout} className="dlv-logoutBtn">
            <span className="dlv-navIconWrap">
              <LogOut className="dlv-navIcon" aria-hidden />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <button
        type="button"
        className={`dlv-backdrop${isOpen ? ' dlv-backdropShow' : ''}`}
        aria-label="Close sidebar"
        onClick={onClose}
      />
    </>
  )
}
