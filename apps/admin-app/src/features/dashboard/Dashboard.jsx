import {
  Users,
  ShoppingCart,
  Clock,
  CheckCircle2,
  DollarSign,
  Store,
  Truck,
  TrendingUp,
  ChevronDown,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    label: "Total Users",
    value: "12,458",
    change: "+12.5%",
    icon: Users,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    spark: [5, 7, 6, 9, 8, 11, 10, 13, 14],
    sparkColor: "#8b5cf6",
  },
  {
    label: "Total Orders",
    value: "8,742",
    change: "+15.3%",
    icon: ShoppingCart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    spark: [4, 6, 5, 8, 7, 9, 8, 11, 13],
    sparkColor: "#3b82f6",
  },
  {
    label: "Active Orders",
    value: "1,248",
    change: "+8.2%",
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    spark: [6, 5, 8, 6, 9, 7, 10, 8, 11],
    sparkColor: "#f59e0b",
  },
  {
    label: "Completed Orders",
    value: "7,162",
    change: "+18.7%",
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    spark: [3, 5, 4, 7, 6, 9, 8, 11, 12],
    sparkColor: "#22c55e",
  },
  {
    label: "Total Revenue",
    value: "₹24,68,590",
    change: "+20.4%",
    icon: DollarSign,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    spark: [4, 6, 5, 9, 8, 12, 11, 14, 16],
    sparkColor: "#10b981",
  },
  {
    label: "Active Franchises",
    value: "320",
    change: "+6.7%",
    icon: Store,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    spark: [5, 5, 6, 6, 7, 7, 8, 8, 9],
    sparkColor: "#06b6d4",
  },
];

const ORDER_OVERVIEW = [
  { date: "May 1",  Placed: 500,  Completed: 320, Cancelled: 80 },
  { date: "May 6",  Placed: 750,  Completed: 480, Cancelled: 110 },
  { date: "May 11", Placed: 900,  Completed: 600, Cancelled: 130 },
  { date: "May 16", Placed: 1000, Completed: 680, Cancelled: 150 },
  { date: "May 21", Placed: 1150, Completed: 780, Cancelled: 160 },
  { date: "May 26", Placed: 1300, Completed: 860, Cancelled: 175 },
  { date: "May 31", Placed: 1480, Completed: 950, Cancelled: 190 },
];

const REVENUE_OVERVIEW = [
  { date: "May 1",  revenue: 120000 },
  { date: "May 6",  revenue: 280000 },
  { date: "May 11", revenue: 350000 },
  { date: "May 16", revenue: 420000 },
  { date: "May 21", revenue: 510000 },
  { date: "May 26", revenue: 620000 },
  { date: "May 31", revenue: 750000 },
];

const TOP_SERVICES = [
  { name: "Screen Repair",   value: 35, color: "#3b82f6" },
  { name: "Battery Replace", value: 25, color: "#6366f1" },
  { name: "Water Damage",    value: 15, color: "#f59e0b" },
  { name: "Software Issue",  value: 15, color: "#8b5cf6" },
  { name: "Other Services",  value: 10, color: "#d1d5db" },
];

const RECENT_ORDERS = [
  { id: "#ERH1256", customer: "Rahul Sharma",  service: "Screen Repair",   status: "Completed",   amount: "₹2,499" },
  { id: "#ERH1255", customer: "Priya Verma",   service: "Battery Replace", status: "In Progress", amount: "₹1,299" },
  { id: "#ERH1254", customer: "Amit Kumar",    service: "Water Damage",    status: "Assigned",    amount: "₹3,599" },
  { id: "#ERH1253", customer: "Neha Singh",    service: "Software Issue",  status: "Pending",     amount: "₹799"   },
  { id: "#ERH1252", customer: "Vikram Patel",  service: "Screen Repair",   status: "Completed",   amount: "₹2,299" },
];

const LIVE_ACTIVITY = [
  { id: "#ERH1256", text: "has been completed",                         time: "2 mins ago",  iconBg: "bg-green-100",  iconColor: "text-green-600",  icon: CheckCircle2 },
  { id: "#ERH1255", text: "assigned to delivery agent",                 time: "5 mins ago",  iconBg: "bg-blue-100",   iconColor: "text-blue-600",   icon: Truck        },
  { id: null,       text: 'New franchise "Repair Masters" registered',  time: "12 mins ago", iconBg: "bg-violet-100", iconColor: "text-violet-600", icon: Store        },
  { id: "#ERH1254", text: "Payment of ₹2,499 received for order",       time: "18 mins ago", iconBg: "bg-emerald-100",iconColor: "text-emerald-600",icon: DollarSign   },
  { id: null,       text: "New user Rahul Sharma registered",           time: "25 mins ago", iconBg: "bg-pink-100",   iconColor: "text-pink-600",   icon: Users        },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Completed:    "bg-green-100 text-green-700",
  "In Progress":"bg-blue-100 text-blue-700",
  Assigned:     "bg-amber-100 text-amber-700",
  Pending:      "bg-orange-100 text-orange-700",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

// ─── Sparkline (pure SVG, no dep) ────────────────────────────────────────────

function Sparkline({ data, color }) {
  const W = 100, H = 28, PAD = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (W - PAD * 2) + PAD;
      const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, change, icon: Icon, iconBg, iconColor, spark, sparkColor }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-1 flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
      <span className="inline-flex w-fit items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
        <TrendingUp className="h-3 w-3" />
        {change}
      </span>
      <p className="text-xs text-slate-400">vs last month</p>
      <Sparkline data={spark} color={sparkColor} />
    </div>
  );
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}:{" "}
          <span className="font-medium">
            {p.value > 10000 ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Heading */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Welcome back, Admin!</h1>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover:border-slate-300">
          <Calendar className="h-4 w-4 text-slate-400" />
          May 23, 2025
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

    

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* Order Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Order Overview</h2>
            <button className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              This Month <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="mb-3 flex gap-4">
            {[
              { name: "Placed",    color: "#3b82f6" },
              { name: "Completed", color: "#22c55e" },
              { name: "Cancelled", color: "#ef4444" },
            ].map((l) => (
              <span key={l.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.name}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ORDER_OVERVIEW} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="Placed"    stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Cancelled" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Revenue Overview</h2>
            <button className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              This Month <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <p className="text-2xl font-semibold text-slate-900">₹24,68,590</p>
          <span className="mb-3 inline-flex items-center gap-0.5 text-xs font-medium text-green-600">
            <TrendingUp className="h-3 w-3" /> +20.4% vs last month
          </span>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_OVERVIEW} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* Recent Orders */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
            <Link to="/orders" className="text-xs font-medium text-blue-600 hover:underline">View All</Link>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                {["Order ID", "Customer", "Service", "Status", "Amount", ""].map((h) => (
                  <th key={h} className="pb-2 pr-3 text-left font-medium uppercase tracking-wide text-slate-400 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="py-2.5 pr-3 font-medium text-blue-600">{o.id}</td>
                  <td className="py-2.5 pr-3 text-slate-700">{o.customer}</td>
                  <td className="py-2.5 pr-3 text-slate-600">{o.service}</td>
                  <td className="py-2.5 pr-3"><StatusBadge status={o.status} /></td>
                  <td className="py-2.5 pr-3 font-medium text-slate-800">{o.amount}</td>
                  <td className="py-2.5 text-right">
                    <button className="rounded-lg p-1 hover:bg-slate-100">
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Top Services */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Top Services</h2>
              <button className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                This Month <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie
                    data={TOP_SERVICES}
                    cx="50%" cy="50%"
                    innerRadius={30} outerRadius={50}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {TOP_SERVICES.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5">
                {TOP_SERVICES.map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                      {s.name}
                    </span>
                    <span className="font-semibold text-slate-700">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Live Activity</h2>
              <Link to="/orders" className="text-xs font-medium text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {LIVE_ACTIVITY.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${a.iconBg}`}>
                      <Icon className={`h-3.5 w-3.5 ${a.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug text-slate-700">
                        {a.id && (
                          <span className="font-medium text-blue-600">{a.id} </span>
                        )}
                        {a.text}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
