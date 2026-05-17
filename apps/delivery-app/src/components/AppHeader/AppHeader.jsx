import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  MdDashboard,
  MdLocalShipping,
  MdNotificationsNone,
  MdOutlineAssignmentTurnedIn,
  MdOutlineInventory2,
  MdPersonOutline,
} from 'react-icons/md'
import './AppHeader.css'

const ROUTE_META = [
  { path: '/', title: 'Dashboard', subtitle: 'Overview & delivery stats', Icon: MdDashboard },
  { path: '/pickup-tasks', title: 'Pickup Tasks', subtitle: 'Assigned pickups', Icon: MdOutlineInventory2 },
  { path: '/delivery-tasks', title: 'Delivery Tasks', subtitle: 'Out for delivery', Icon: MdLocalShipping },
  { path: '/completed-tasks', title: 'Completed Tasks', subtitle: 'Finished pickups & deliveries', Icon: MdOutlineAssignmentTurnedIn },
  { path: '/notifications', title: 'Notifications', subtitle: 'Alerts & updates', Icon: MdNotificationsNone },
  { path: '/profile', title: 'Profile', subtitle: 'Your account', Icon: MdPersonOutline },
]

export default function AppHeader() {
  const { pathname } = useLocation()

  const meta = useMemo(() => {
    const found = ROUTE_META.find((r) => r.path === pathname)
    return found ?? ROUTE_META[0]
  }, [pathname])

  const Icon = meta.Icon

  return (
    <header className="appHeader" role="banner">
      <div className="appHeaderInner">
        <span className="appHeaderIcon" aria-hidden>
          <Icon />
        </span>
        <div className="appHeaderText">
          <h1 className="appHeaderTitle">{meta.title}</h1>
          <p className="appHeaderSubtitle">{meta.subtitle}</p>
        </div>
      </div>
    </header>
  )
}
