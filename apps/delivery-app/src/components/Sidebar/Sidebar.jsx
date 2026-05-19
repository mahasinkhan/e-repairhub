import { NavLink, useNavigate } from 'react-router-dom'
import {
  MdCheckCircle,
  MdClose,
  MdDashboard,
  MdLocalShipping,
  MdLogout,
  MdNotificationsNone,
  MdOutlineAssignmentTurnedIn,
  MdOutlineInventory2,
  MdPersonOutline,
} from 'react-icons/md'
import './Sidebar.css'

const iconMap = {
  grid: MdDashboard,
  pickup: MdOutlineInventory2,
  delivery: MdLocalShipping,
  completed: MdOutlineAssignmentTurnedIn,
  bell: MdNotificationsNone,
  user: MdPersonOutline,
}

function NavIcon({ name }) {
  const Cmp = iconMap[name] ?? MdCheckCircle
  return <Cmp className="menuIconSvg" aria-hidden />
}

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const nav = [
    { to: '.', label: 'Dashboard', icon: 'grid', end: true },
    { to: 'pickup-tasks', label: 'Pickup Tasks', icon: 'pickup' },
    { to: 'delivery-tasks', label: 'Delivery Tasks', icon: 'delivery' },
    { to: 'completed-tasks', label: 'Completed Tasks', icon: 'completed' },
    { to: 'notifications', label: 'Notifications', icon: 'bell' },
    { to: 'profile', label: 'Profile', icon: 'user' },
  ]

  const sidebarClass = `sidebar ${isOpen ? 'sidebarOpen' : ''}`

  function handleLogout() {
    if (!window.confirm('Sign out of the delivery panel?')) return
    onClose?.()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <aside className={sidebarClass} aria-label="Sidebar navigation">
        <div className="sidebarHeader">
          <div className="brand">
            <span className="brandDot" />
            <div className="brandText">
              <div className="brandTitle">E-RepairHub</div>
              <div className="brandSub">Delivery Console</div>
            </div>
          </div>

          <button type="button" className="closeBtn" onClick={onClose} aria-label="Close sidebar">
            <MdClose />
          </button>
        </div>

        <nav className="menu">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `menuItem ${isActive ? 'menuItemActive' : ''}`}
              onClick={onClose}
            >
              <span className="menuIcon">
                <NavIcon name={item.icon} />
              </span>
              <span className="menuLabel">{item.label}</span>
              <span className="menuGlow" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebarFooter">
          <div className="footerCard">
            <div className="footerTitle">Today</div>
            <div className="footerText">Keep deliveries moving smoothly.</div>
          </div>
          <button type="button" className="menuItem logoutBtn" onClick={handleLogout}>
            <span className="menuIcon">
              <MdLogout className="menuIconSvg" aria-hidden />
            </span>
            <span className="menuLabel">Logout</span>
          </button>
        </div>
      </aside>

      <button
        type="button"
        className={`backdrop ${isOpen ? 'backdropShow' : ''}`}
        aria-label="Close sidebar backdrop"
        onClick={onClose}
      />
    </>
  )
}
