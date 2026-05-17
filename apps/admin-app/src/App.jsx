import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./features/auth/Login.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import CMS from "./pages/cms/CMS.jsx";
import Catalog from "./pages/catalog/Catalog.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Delivery from "./pages/delivery/Delivery.jsx";
import Franchise from "./pages/franchise/Franchise.jsx";
import Notifications from "./pages/notifications/Notifications.jsx";
import OrderDetails from "./pages/orders/OrderDetails.jsx";
import Orders from "./pages/orders/Orders.jsx";
import Payments from "./pages/payments/Payments.jsx";
import Pricing from "./pages/pricing/Pricing.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Reports from "./pages/reports/Reports.jsx";
import Roles from "./pages/roles/Roles.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Support from "./pages/support/Support.jsx";
import Users from "./pages/users/Users.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="franchise" element={<Franchise />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="cms" element={<CMS />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="support" element={<Support />} />
        <Route path="settings" element={<Settings />} />
        <Route path="roles" element={<Roles />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route path="/" element={<Navigate to="login" replace />} />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
}
