import { useEffect, useRef, useState } from 'react'
import { Menu, Bell, Sun, Moon, ChevronDown } from 'lucide-react'
import '../../styles/navbar.css'

export default function Navbar({
  pageTitle,
  onMenuClick,
  themeSoft,
  onToggleTheme,
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  return (
    <header className="navbar">
      <div className="navbar__left">
        <button
          type="button"
          className="navbar__menu-btn"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
      </div>
      <div className="navbar__center">
        <h1 className="navbar__page-title">{pageTitle}</h1>
      </div>
      <div className="navbar__right">
        <button
          type="button"
          className="navbar__icon-btn"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="navbar__dot" />
        </button>
        <button
          type="button"
          className="navbar__icon-btn"
          aria-label="Toggle appearance"
          onClick={onToggleTheme}
          title={themeSoft ? 'Default theme' : 'Soft contrast theme'}
        >
          {themeSoft ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="navbar__profile" ref={wrapRef}>
          <button
            type="button"
            className="navbar__avatar-btn"
            aria-expanded={open}
            aria-haspopup="true"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="navbar__avatar">ER</span>
            <ChevronDown className="navbar__chevron" aria-hidden />
          </button>
          {open ? (
            <div className="navbar__dropdown" role="menu">
              <div className="navbar__dropdown-header">
                <div className="navbar__dropdown-name">North City Franchise</div>
                <div className="navbar__dropdown-role">Franchise owner</div>
              </div>
              <button type="button" className="navbar__dropdown-item" role="menuitem">
                View franchise profile
              </button>
              <button type="button" className="navbar__dropdown-item" role="menuitem">
                Support &amp; helpdesk
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
