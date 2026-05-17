import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import CompletedTasks from "./pages/CompletedTasks/CompletedTasks.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import DeliveryTasks from "./pages/DeliveryTasks/DeliveryTasks.jsx";
import Login from "./pages/Login.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";
import PickupTasks from "./pages/PickupTasks/PickupTasks.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute allowedRoles={["delivery"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pickup-tasks" element={<PickupTasks />} />
        <Route path="delivery-tasks" element={<DeliveryTasks />} />
        <Route path="completed-tasks" element={<CompletedTasks />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
