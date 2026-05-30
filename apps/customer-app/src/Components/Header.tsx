import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuth";

const Header: React.FC = () => {
  const navigate                         = useNavigate();
  const { customer, logout, isLoggedIn } = useCustomerAuth();

  const [menuOpen,     setMenuOpen]     = useState(false);
  const [visible,      setVisible]      = useState(true);
  const [userDropdown, setUserDropdown] = useState(false);
  const lastYRef    = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const y     = window.scrollY || 0;
      const lastY = lastYRef.current;
      const delta = y - lastY;

      if (Math.abs(delta) > 6) {
        if (delta > 0 && y > 10) { setVisible(false); if (menuOpen) setMenuOpen(false); }
        else if (delta < 0)      { setVisible(true); }
      }
      if (y <= 10) setVisible(true);
      lastYRef.current = y;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  const initials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // ── Inline styles replacing Header.css dependency ─────────────────────────
  const headerStyle: React.CSSProperties = {
    position:        "fixed",
    top:             0,
    left:            0,
    right:           0,
    zIndex:          1000,
    background:      "#0f172a",
    borderBottom:    "1px solid rgba(255,255,255,0.08)",
    transform:       visible ? "translateY(0)" : "translateY(-100%)",
    transition:      "transform 0.3s ease",
    boxShadow:       "0 2px 20px rgba(0,0,0,0.3)",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth:      1200,
    margin:        "0 auto",
    padding:       "0 20px",
    height:        64,
    display:       "flex",
    alignItems:    "center",
    justifyContent:"space-between",
    gap:           24,
  };

  const logoStyle: React.CSSProperties = {
    display:        "flex",
    alignItems:     "center",
    gap:            10,
    textDecoration: "none",
    flexShrink:     0,
  };

  const navStyle: React.CSSProperties = {
    display:    "flex",
    alignItems: "center",
    gap:        4,
  };

  const linkStyle: React.CSSProperties = {
    color:          "rgba(255,255,255,0.75)",
    textDecoration: "none",
    fontSize:       13,
    fontWeight:     500,
    padding:        "6px 10px",
    borderRadius:   8,
    transition:     "all .15s",
    whiteSpace:     "nowrap",
  };

  return (
    <>
      {/* Global style for nav link hover + hamburger */}
      <style>{`
        .erh-nav-link:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
        .erh-cta-link { background: rgba(249,115,22,0.15) !important; color: #f97316 !important; border: 1px solid rgba(249,115,22,0.3) !important; }
        .erh-cta-link:hover { background: rgba(249,115,22,0.25) !important; }
        .erh-hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
        .erh-hamburger span { display: block; width: 22px; height: 2px; background: rgba(255,255,255,0.8); border-radius: 2px; transition: all .3s; }
        .erh-mobile-nav { display: none; flex-direction: column; background: #0f172a; border-top: 1px solid rgba(255,255,255,0.08); padding: 12px 20px 20px; gap: 2px; }
        .erh-mobile-nav a, .erh-mobile-nav button { color: rgba(255,255,255,0.8); font-size: 14px; padding: 10px 12px; border-radius: 10px; text-decoration: none; display: block; transition: background .15s; }
        .erh-mobile-nav a:hover { background: rgba(255,255,255,0.07); }
        @media (max-width: 900px) {
          .erh-desktop-nav { display: none !important; }
          .erh-hamburger { display: flex !important; }
          .erh-mobile-nav--open { display: flex !important; }
        }
      `}</style>

      <header style={headerStyle}>
        <div style={innerStyle}>

          {/* Logo */}
          <a href="/" style={logoStyle}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 16, flexShrink: 0 }}>
              E
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>RepairHub</span>
          </a>

          {/* Desktop Nav */}
          <nav className="erh-desktop-nav" style={navStyle}>
            {[
              { href: "/about",   label: "About"       },
              { href: "/brand",   label: "Brand"       },
              { href: "/service", label: "Services"    },
              { href: "/pricing", label: "Pricing"     },
              { href: "/track",   label: "Track Order" },
              { href: "/blog",    label: "Blog"        },
              { href: "/policie", label: "Policies"    },
            ].map(item => (
              <a key={item.href} href={item.href} className="erh-nav-link" style={linkStyle}>{item.label}</a>
            ))}

            <a href="/contact" className="erh-nav-link erh-cta-link"
              style={{ ...linkStyle, marginLeft: 4, borderRadius: 999, padding: "6px 14px" }}>
              Contact
            </a>

            {/* ── Auth section ── */}
            {isLoggedIn && customer ? (
              <div ref={dropdownRef} style={{ position: "relative", marginLeft: 8 }}>
                <button
                  onClick={() => setUserDropdown(d => !d)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
                    borderRadius: 999, padding: "5px 12px 5px 5px", cursor: "pointer", color: "#fff",
                    transition: "background .15s",
                  }}>
                  <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                    {initials(customer.name || "C")}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                    {customer.name?.split(" ")[0] || "Me"}
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
                </button>

                {userDropdown && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 12px)", right: 0,
                    background: "#fff", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    minWidth: 210, zIndex: 9999, overflow: "hidden", border: "1px solid #e2e8f0",
                  }}>
                    {/* User info */}
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: "0 0 2px" }}>{customer.name}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{customer.phone}</p>
                    </div>
                    {[
                      { to: "/dashboard", icon: "🏠", label: "Dashboard"   },
                      { to: "/orders",    icon: "📋", label: "My Orders"   },
                      { to: "/book",      icon: "🔧", label: "Book Repair" },
                      { to: "/profile",   icon: "👤", label: "Profile"     },
                    ].map(item => (
                      <button key={item.to}
                        onClick={() => { navigate(item.to); setUserDropdown(false); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "#1e293b", fontWeight: 500, textAlign: "left" as const }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                        <span>{item.icon}</span> {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: "1px solid #f1f5f9" }}>
                      <button
                        onClick={() => { logout(); navigate("/"); setUserDropdown(false); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "#b91c1c", fontWeight: 600, textAlign: "left" as const }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                style={{ marginLeft: 8, background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(249,115,22,0.35)", whiteSpace: "nowrap" as const }}>
                Login / Sign Up
              </button>
            )}
          </nav>

          {/* Hamburger */}
          <button
            className="erh-hamburger"
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Toggle menu">
            <span style={{ transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        </div>

        {/* Mobile Nav */}
        <div className={`erh-mobile-nav ${menuOpen ? "erh-mobile-nav--open" : ""}`}>
          {[
            { href: "/about",   label: "About"       },
            { href: "/brand",   label: "Brand"       },
            { href: "/service", label: "Services"    },
            { href: "/pricing", label: "Pricing"     },
            { href: "/track",   label: "Track Order" },
            { href: "/blog",    label: "Blog"        },
            { href: "/policie", label: "Policies"    },
            { href: "/contact", label: "Contact"     },
          ].map(item => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
          ))}

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10, marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
            {isLoggedIn && customer ? (
              <>
                <div style={{ padding: "10px 12px 8px", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                  Signed in as <strong style={{ color: "#fff" }}>{customer.name?.split(" ")[0]}</strong>
                </div>
                <a href="/dashboard" onClick={() => setMenuOpen(false)}>🏠 Dashboard</a>
                <a href="/orders"    onClick={() => setMenuOpen(false)}>📋 My Orders</a>
                <a href="/profile"   onClick={() => setMenuOpen(false)}>👤 Profile</a>
                <button
                  onClick={() => { logout(); navigate("/"); setMenuOpen(false); }}
                  style={{ background: "none", border: "none", color: "#fca5a5", fontSize: 14, padding: "10px 12px", cursor: "pointer", fontWeight: 600, textAlign: "left" as const, borderRadius: 10, width: "100%" }}>
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <a href="/login" onClick={() => setMenuOpen(false)}
                style={{ color: "#f97316 !important", fontWeight: 700 }}>
                🔐 Login / Sign Up
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div style={{ height: 64 }} />
    </>
  );
};

export default Header;
