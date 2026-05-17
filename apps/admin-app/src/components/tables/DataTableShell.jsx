/** Wrapper for future data tables — paste table markup inside children. */
export default function DataTableShell({ children, title = "Table" }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
