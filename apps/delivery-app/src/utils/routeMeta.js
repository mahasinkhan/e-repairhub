import {
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  PackageSearch,
  Truck,
  Bell,
  BarChart3,
  UserCircle,
  CheckCircle2,
  Settings,
} from 'lucide-react'

export const ROUTE_META = [
  { path: '/', title: 'Dashboard', Icon: LayoutDashboard },
  { path: '/tasks', title: 'Tasks', Icon: ClipboardList },
  { path: '/otp-verification', title: 'OTP Verification', Icon: ShieldCheck },
  { path: '/pickup-management', title: 'Pickup Management', Icon: PackageSearch },
  { path: '/delivery-management', title: 'Delivery Management', Icon: Truck },
  { path: '/pickup-tasks', title: 'Pickup Tasks', Icon: PackageSearch },
  { path: '/delivery-tasks', title: 'Delivery Tasks', Icon: Truck },
  { path: '/completed-tasks', title: 'Completed Tasks', Icon: CheckCircle2 },
  { path: '/notifications', title: 'Notifications', Icon: Bell },
  { path: '/performance-reports', title: 'Performance Reports', Icon: BarChart3 },
  { path: '/profile', title: 'Profile', Icon: UserCircle },
  { path: '/settings', title: 'Settings', Icon: Settings },
]

export function getRouteMeta(pathname) {
  const found = ROUTE_META.find((r) => r.path === pathname)
  return found ?? ROUTE_META[0]
}
