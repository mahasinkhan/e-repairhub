import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { CustomerAuthProvider, useCustomerAuth } from "./context/CustomerAuth";

import Header     from "./Components/Header";
import ScrollToTop from "./Components/ScrollToTop";
import Breadcrumbs from "./Components/Breadcrumbs";

import Home        from "./Pages/Home";
import About       from "./Pages/About";
import Brand       from "./Pages/Brand";
import Service     from "./Pages/Service";
import Model       from "./Pages/Model";
import Pricing     from "./Pages/Pricing";
import Track       from "./Pages/Track";
import Blog        from "./Pages/Blog";
import Policie     from "./Pages/Policie";
import Contact     from "./Pages/Contact";
import Book        from "./Pages/Book";
import Confirm     from "./Pages/Confirm";
import Login       from "./Pages/Login";
import Dashboard   from "./Pages/Dashboard";
import OrderHistory from "./Pages/OrderHistory";
import Profile     from "./Pages/Profile";

import "./App.css";

// Pages that use their own full-page layout (no shared header/breadcrumbs)
const STANDALONE_ROUTES = ["/login", "/dashboard", "/orders", "/profile"];

function RouteScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname, search]);
  return null;
}

function AppRoutes() {
  const { pathname } = useLocation();
  const isHome       = pathname === "/";
  const isStandalone = STANDALONE_ROUTES.some(r => pathname.startsWith(r));

  return (
    <>
      {/* Only show shared header & breadcrumbs on regular pages */}
      {!isStandalone && <Header />}
      {!isStandalone && <Breadcrumbs />}

      <div className={!isStandalone ? `app-main ${isHome ? "" : "app-main--offset"}` : ""}>
        <Routes>
          {/* Public pages */}
          <Route path="/"        element={<Home />}    />
          <Route path="/about"   element={<About />}   />
          <Route path="/brand"   element={<Brand />}   />
          <Route path="/service" element={<Service />} />
          <Route path="/model"   element={<Model />}   />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/price"   element={<Pricing />} />
          <Route path="/track"   element={<Track />}   />
          <Route path="/book"    element={<Book />}    />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/blog"    element={<Blog />}    />
          <Route path="/policie" element={<Policie />} />
          <Route path="/contact" element={<Contact />} />

          {/* Customer portal — standalone layout */}
          <Route path="/login"     element={<Login />}        />
          <Route path="/dashboard" element={<Dashboard />}    />
          <Route path="/orders"    element={<OrderHistory />} />
          <Route path="/profile"   element={<Profile />}      />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isStandalone && <ScrollToTop />}
    </>
  );
}

function App() {
  return (
    <CustomerAuthProvider>
      <Router>
        <RouteScrollToTop />
        <AppRoutes />
      </Router>
    </CustomerAuthProvider>
  );
}

export default App;
