import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { getUnreadCount, subscribeNotifications } from '../../services/notificationStore.js'
import './AppHeader.css'

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function initialsFromUser(user) {
  const name = (user?.name || user?.email || 'DA').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function HeaderToolbarActions({ className = '' }) {
  const { pathname } = useLocation()
  const user = useMemo(() => readStoredUser(), [pathname])
  const [notifCount, setNotifCount] = useState(() => getUnreadCount())

  useEffect(() => subscribeNotifications(() => setNotifCount(getUnreadCount())), [])

  const displayName = user?.name || 'Ramesh Kumar'
  const roleLabel =
    user?.role === 'delivery' ? 'Delivery Agent' : user?.role || 'Delivery Agent'

  return (
    <div className={`appHeaderRight${className ? ` ${className}` : ''}`}>
      <Link
        to="/notifications"
        className="appHeaderNotif"
        aria-label={`Notifications, ${notifCount} unread`}
      >
        <Bell size={20} strokeWidth={2} />
        {notifCount > 0 ? (
          <span className="appHeaderNotifBadge">{notifCount > 9 ? '9+' : notifCount}</span>
        ) : null}
      </Link>

      <div className="appHeaderProfile">
        <div className="appHeaderAvatar" aria-hidden>
          {user?.profileImage ? (
            <img src={user.profileImage} alt="" className="appHeaderAvatarImg" />
          ) : (
            <span>{initialsFromUser(user)}</span>
          )}
        </div>
        <div className="appHeaderProfileText">
          <p className="appHeaderProfileName">{displayName}</p>
          <p className="appHeaderProfileRole">{roleLabel}</p>
        </div>
      </div>
    </div>
  )
}
