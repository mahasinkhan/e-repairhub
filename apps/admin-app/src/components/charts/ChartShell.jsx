/** Placeholder shell for charts (Recharts, Chart.js, etc.). */
export default function ChartShell({ title = "Chart" }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
      {title} — paste chart here
    </div>
  );
}
