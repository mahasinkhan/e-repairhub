import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import AdminHeader from "../components/layout/AdminHeader.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import { AdminUIProvider, useAdminUI } from "../context/AdminUIContext.jsx";

function AdminLayoutShell() {
  const { sidebarOpen, closeSidebar } = useAdminUI();

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={closeSidebar}
        />
      ) : null}

      {/* Sidebar: full viewport height, does not scroll with page content */}
      <div
        className={[
          "z-50 flex h-[100dvh] max-h-[100dvh] w-64 shrink-0 transform transition-transform duration-200 ease-out",
          "fixed inset-y-0 left-0 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <Sidebar />
      </div>

      {/* Main column: only this area scrolls */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-0">
        <AdminHeader />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminUIProvider>
      <AdminLayoutShell />
    </AdminUIProvider>
  );
}
