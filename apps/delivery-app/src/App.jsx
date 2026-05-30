import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Tasks from "./pages/Tasks/Tasks.jsx";
import PickupManagement from "./pages/PickupManagement/PickupManagement.jsx";
import DeliveryManagement from "./pages/DeliveryManagement/DeliveryManagement.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";
import PerformanceReports from "./pages/PerformanceReports/PerformanceReports.jsx";
import Settings from "./pages/Settings/Setting.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute allowedRoles={["delivery"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="pickup-management" element={<PickupManagement />} />
        <Route path="delivery-management" element={<DeliveryManagement />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="performance-reports" element={<PerformanceReports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="otp-verification" element={<Tasks />} />
        <Route path="completed-tasks" element={<Tasks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}