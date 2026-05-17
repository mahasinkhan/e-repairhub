import React, { useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import "./Breadcrumbs.css";

type Crumb = { label: string; to?: string };

const decode = (v: string | null) => (v ? decodeURIComponent(v) : "");

function buildCrumbs(pathname: string, search: URLSearchParams): Crumb[] {
  const brand = decode(search.get("brand"));
  const service = decode(search.get("service"));
  const model = decode(search.get("model"));
  const color = decode(search.get("color"));

  const base: Crumb[] = [{ label: "Home", to: "/" }];

  // Simple flow-aware trail (best-effort).
  if (pathname === "/") return [];

  if (pathname === "/brand") {
    if (service) base.push({ label: "Brand", to: `/brand?service=${encodeURIComponent(service)}` });
    else base.push({ label: "Brand" });
    return base;
  }

  if (pathname === "/model") {
    if (service) base.push({ label: "Brand", to: `/brand?service=${encodeURIComponent(service)}` });
    else base.push({ label: "Brand", to: "/brand" });
    base.push({ label: "Model" });
    return base;
  }

  if (pathname === "/service") {
    base.push({ label: "Brand", to: "/brand" });
    if (brand) base.push({ label: brand, to: `/model?brand=${encodeURIComponent(brand)}` });
    base.push({ label: "Service" });
    return base;
  }

  if (pathname === "/pricing" || pathname === "/price") {
    base.push({ label: "Brand", to: "/brand" });
    if (brand) base.push({ label: brand, to: `/model?brand=${encodeURIComponent(brand)}` });
    if (model) base.push({ label: model, to: `/service?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}` });
    if (service) base.push({ label: "Service", to: `/service?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}` });
    base.push({ label: "Summary" });
    return base;
  }

  if (pathname === "/track") return [];

  // fallback
  base.push({ label: pathname.replace("/", "") || "Page" });
  return base;
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const crumbs = useMemo(() => buildCrumbs(pathname, searchParams), [pathname, searchParams]);

  if (!crumbs.length) return null;

  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {crumbs.map((c, idx) => {
        const last = idx === crumbs.length - 1;
        return (
          <span key={`${c.label}-${idx}`} className="crumbs__item">
            {c.to && !last ? (
              <Link className="crumbs__link" to={c.to}>
                {c.label}
              </Link>
            ) : (
              <span className={`crumbs__text${last ? " is-current" : ""}`}>{c.label}</span>
            )}
            {!last && <span className="crumbs__sep" aria-hidden="true">›</span>}
          </span>
        );
      })}
    </nav>
  );
}

