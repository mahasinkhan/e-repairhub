import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/sidebar/Sidebar'
import Navbar from '../components/navbar/Navbar'
import { resolveNavbarTitle } from '../utils/navTitles'
import '../styles/layout.css'

const MOBILE_MAX = 900

export default function MainLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [themeSoft, setThemeSoft] = useState(false)

  useEffect(() => {
    if (themeSoft) {
      document.documentElement.setAttribute('data-theme', 'soft')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [themeSoft])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > MOBILE_MAX) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onToggleCollapse = useCallback(() => {
    if (window.innerWidth <= MOBILE_MAX) {
      setMobileOpen(false)
      return
    }
    setCollapsed((c) => !c)
  }, [])

  const rootClass = [
    'layout-root',
    collapsed ? 'sidebar-collapsed' : '',
    mobileOpen ? 'mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <Navbar
        pageTitle={resolveNavbarTitle(location.pathname)}
        onMenuClick={() => setMobileOpen(true)}
        themeSoft={themeSoft}
        onToggleTheme={() => setThemeSoft((t) => !t)}
      />
      <div className="layout-main">
        <div className="layout-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
