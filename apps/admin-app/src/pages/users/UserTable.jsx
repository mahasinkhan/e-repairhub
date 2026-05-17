import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "../../utils/format.js";

function Avatar({ name, image }) {
  const initial = (name || "?").slice(0, 1).toUpperCase();
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="h-10 w-10 rounded-full border border-slate-200 object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-blue-50 text-sm font-semibold text-blue-700">
      {initial}
    </div>
  );
}

function RoleBadge({ role }) {
  const map = {
    admin: "bg-violet-100 text-violet-800 ring-violet-200",
    franchise: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    delivery: "bg-amber-100 text-amber-900 ring-amber-200",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${map[role] || "bg-slate-100 text-slate-700"}`}
    >
      {role}
    </span>
  );
}

export default function UserTable({
  users,
  loading,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  if (loading && (!users || users.length === 0)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Loading users…
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        No users found. Adjust filters or add a new user.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Profile</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
              <th className="hidden px-4 py-3 font-semibold text-slate-700 md:table-cell">Email</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Role</th>
              <th className="hidden px-4 py-3 font-semibold text-slate-700 lg:table-cell">Phone</th>
              <th className="hidden px-4 py-3 font-semibold text-slate-700 xl:table-cell">City</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              <th className="hidden px-4 py-3 font-semibold text-slate-700 lg:table-cell">Created</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <Avatar name={u.name} image={u.profileImage} />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="hidden max-w-[200px] truncate px-4 py-3 text-slate-600 md:table-cell">
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{u.phone || "—"}</td>
                <td className="hidden px-4 py-3 text-slate-600 xl:table-cell">{u.city || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={u.isActive}
                    onClick={() => onToggleActive(u)}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
                      u.isActive
                        ? "border-emerald-200 bg-emerald-500"
                        : "border-slate-200 bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        u.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 lg:table-cell">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(u)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(u)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(u)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Deactivate"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
