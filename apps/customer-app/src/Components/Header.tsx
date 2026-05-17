import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Header.css";

const Header: React.FC = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || 0;
      setScrolled(y > 80);

      const lastY = lastYRef.current;
      const delta = y - lastY;
      // tiny jitters ignore
      if (Math.abs(delta) > 6) {
        // User requirement:
        // - by default (top/hero) header visible
        // - scrolling down => header hide
        // - scrolling up => header show
        if (delta > 0 && y > 10) {
          setVisible(false);
          if (menuOpen) setMenuOpen(false);
        } else if (delta < 0) {
          setVisible(true);
        }
      }

      // near top: always keep visible
      if (y <= 10) setVisible(true);
      lastYRef.current = y;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  const solidBar = true;

  return (
    <header className={`header ${solidBar ? "header--scrolled" : ""} ${visible ? "" : "header--hidden"}`}>
      <div className="header__inner">
        {/* Logo */}
        <a href="/" className="header__logo">
          <span className="logo-mark">E</span>
          <span className="logo-text">RepairHub</span>
        </a>

        {/* Desktop Nav */}
        <nav className="header__nav">
          <a href="/about"   className="header__link">About</a>
          <a href="/brand"   className="header__link">Brand</a>
          <a href="/service" className="header__link">Services</a>
          <a href="/pricing" className="header__link">Pricing</a>
          <a href="/track"   className="header__link">Track Order</a>
          <a href="/blog"    className="header__link">Blog</a>
          <a href="/policie" className="header__link">Policies</a>
          <a href="/contact" className="header__link header__link--cta">Contact</a>
        </nav>

        {/* Hamburger */}
        <button
          className={`header__hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`header__mobile-nav ${menuOpen ? "header__mobile-nav--open" : ""}`}>
        <a href="/about"   onClick={() => setMenuOpen(false)}>About</a>
        <a href="/brand"   onClick={() => setMenuOpen(false)}>Brand</a>
        <a href="/service" onClick={() => setMenuOpen(false)}>Services</a>
        <a href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        <a href="/track"   onClick={() => setMenuOpen(false)}>Track Order</a>
        <a href="/blog"    onClick={() => setMenuOpen(false)}>Blog</a>
        <a href="/policie" onClick={() => setMenuOpen(false)}>Policies</a>
        <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
      </div>
    </header>
  );
};

export default Header;
