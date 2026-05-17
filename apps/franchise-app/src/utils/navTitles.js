const TITLES = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/repair": "Repair",
  "/earnings": "Earnings",
  "/notifications": "Notifications",
  "/delivery": "Delivery",
  "/reports": "Reports",
  "/profile": "Profile",
  "/settings": "Settings",
};

/** pathname is full browser path, e.g. /franchise/orders */
export function resolveNavbarTitle(pathname) {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "";
  let tail = pathname;
  if (base && pathname.startsWith(base)) {
    tail = pathname.slice(base.length) || "/";
  }
  if (!tail.startsWith("/")) tail = `/${tail}`;
  tail = tail.replace(/\/+$/, "") || "/";
  return TITLES[tail] ?? "Franchise Panel";
}

