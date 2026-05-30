import { Bell, LogOut, Menu, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminUI } from "../../context/AdminUIContext.jsx";
import { useAuthStore } from "../../features/auth/auth.store.js";

export default function AdminHeader() {
  const { toggleSidebar } = useAdminUI();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-slate-700 hidden sm:block">
          Admin Panel
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
        </button>
        <div className="mx-1 h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
            <UserCircle className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none">
              {user?.name || user?.username || "Admin"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition ml-1"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}