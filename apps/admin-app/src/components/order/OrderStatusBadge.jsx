const STATUS_STYLES = {
  placed:      "bg-slate-100 text-slate-700",
  confirmed:   "bg-blue-100 text-blue-700",
  assigned:    "bg-indigo-100 text-indigo-700",
  picked:      "bg-cyan-100 text-cyan-700",
  repairing:   "bg-yellow-100 text-yellow-700",
  completed:   "bg-green-100 text-green-700",
  delivered:   "bg-teal-100 text-teal-700",
  cancelled:   "bg-red-100 text-red-700",
  new:         "bg-orange-100 text-orange-700",
};

export default function OrderStatusBadge({ status }) {
  const key = status?.toLowerCase() ?? "placed";
  const style = STATUS_STYLES[key] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {status ?? "—"}
    </span>
  );
}