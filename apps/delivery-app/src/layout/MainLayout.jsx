import { useEffect, useState } from "react";
import { HiBars3 } from "react-icons/hi2";
import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import "../styles/layout.css";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="appLayout">
      <div className="mobileTopBar">
        <button
          type="button"
          className="toggleBtn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          <HiBars3 aria-hidden className="toggleIcon" />
          <span>Menu</span>
        </button>

        <div className="mobileBrand" aria-label="App brand">
          <span className="mobileBrandDot" />
          <span>Delivery Console</span>
        </div>
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
