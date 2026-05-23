import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteMeta } from '../../utils/routeMeta.js'
import HeaderToolbarActions from './HeaderToolbarActions.jsx'
import './AppHeader.css'

export default function AppHeader() {
  const { pathname } = useLocation()
  const meta = useMemo(() => getRouteMeta(pathname), [pathname])
  const PageIcon = meta.Icon

  return (
    <header className="appHeader" role="banner">
      <div className="appHeaderBar">
        <div className="appHeaderLeft">
          <span className="appHeaderPageIcon" aria-hidden>
            <PageIcon size={18} strokeWidth={2.25} />
          </span>
          <h1 className="appHeaderPageTitle">{meta.title}</h1>
        </div>

        <HeaderToolbarActions />
      </div>
    </header>
  )
}
