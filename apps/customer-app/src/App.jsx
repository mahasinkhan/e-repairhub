import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Components
import Header from "./Components/Header";
import ScrollToTop from "./Components/ScrollToTop";
import Breadcrumbs from "./Components/Breadcrumbs";

// Pages
import Home     from "./Pages/Home";
import About    from "./Pages/About";
import Brand    from "./Pages/Brand";
import Service  from "./Pages/Service";
import Model    from "./Pages/Model";
import Pricing  from "./Pages/Pricing";
import Track    from "./Pages/Track";
import Blog     from "./Pages/Blog";
import Policie  from "./Pages/Policie";
import Contact  from "./Pages/Contact";

import "./App.css";

function RouteScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Ensure new routes always start at top (works with Lenis too).
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
  const isHome = pathname === "/";

  return (
    <div className={`app-main ${isHome ? "" : "app-main--offset"}`}>
      <Routes>
        <Route path="/"        element={<Home />}    />
        <Route path="/about"   element={<About />}   />
        <Route path="/brand"   element={<Brand />}   />
        <Route path="/service" element={<Service />} />
        <Route path="/model"   element={<Model />}   />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/price" element={<Pricing />} />
        <Route path="/track"   element={<Track />}   />
        <Route path="/blog"    element={<Blog />}    />
        <Route path="/policie" element={<Policie />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <RouteScrollToTop />
      <Header />
      <Breadcrumbs />
      <AppRoutes />
      <ScrollToTop />
    </Router>
  );
}

export default App;
