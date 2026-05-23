import { useEffect, useMemo, useState } from "react";
import { HiBars3 } from "react-icons/hi2";
import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader.jsx";
import HeaderToolbarActions from "../components/AppHeader/HeaderToolbarActions.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import { getRouteMeta } from "../utils/routeMeta.js";
import "../styles/layout.css";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const meta = useMemo(() => getRouteMeta(location.pathname), [location.pathname]);
  const PageIcon = meta.Icon;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="appLayout">
      <div className="mobileTopBar">
        <div className="mobileTopBarLeft">
          <button
            type="button"
            className="toggleBtn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <HiBars3 aria-hidden className="toggleIcon" />
            <span className="toggleBtnLabel">Menu</span>
          </button>

          <div className="mobileTopBarTitle">
            <span className="mobileTopBarPageIcon" aria-hidden>
              <PageIcon size={18} strokeWidth={2.25} />
            </span>
            <h1 className="mobileTopBarPageName">{meta.title}</h1>
          </div>
        </div>

        <HeaderToolbarActions className="mobileTopBarActions" />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="content" role="main">
        <AppHeader />
        <div className="contentScroll">
          <div className="contentInner">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
