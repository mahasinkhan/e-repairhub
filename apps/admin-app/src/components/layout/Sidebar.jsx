import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Tag,
  Store,
  Truck,
  CreditCard,
  BarChart3,
  Globe,
  Bell,
  LifeBuoy,
  Settings,
  Shield,
  UserCircle,
  LogOut,
  PanelLeftClose,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ADMIN_NAV } from "../../constants/nav.config.js";
import { useAdminUI } from "../../context/AdminUIContext.jsx";

const ICONS = {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Tag,
  Store,
  Truck,
  CreditCard,
  BarChart3,
  Globe,
  Bell,
  LifeBuoy,
  Settings,
  Shield,
  UserCircle,
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { closeSidebar } = useAdminUI();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  function onNav() {
    closeSidebar();
  }

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-sm">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
          E
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">E-RepairHub</p>
          <p className="truncate text-xs text-slate-500">Admin Console</p>
        </div>
        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Close menu"
          onClick={closeSidebar}
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {ADMIN_NAV.map((item) => {
          const Icon = ICONS[item.icon] || LayoutDashboard;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNav}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
