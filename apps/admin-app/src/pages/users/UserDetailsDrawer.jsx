import { X } from "lucide-react";
import { formatDate } from "../../utils/format.js";

export default function UserDetailsDrawer({ open, user, loading, onClose }) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[90] bg-slate-900/40 lg:bg-slate-900/20"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">User details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : user ? (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
                <dd className="mt-1 font-medium text-slate-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
                <dd className="mt-1 text-slate-800">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Username</dt>
                <dd className="mt-1 text-slate-800">{user.username}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</dt>
                <dd className="mt-1 text-slate-800">{user.role}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
                <dd className="mt-1 text-slate-800">{user.isActive ? "Active" : "Inactive"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</dt>
                <dd className="mt-1 text-slate-800">{user.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</dt>
                <dd className="mt-1 text-slate-800">{user.address || "—"}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">City</dt>
                  <dd className="mt-1 text-slate-800">{user.city || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">State</dt>
                  <dd className="mt-1 text-slate-800">{user.state || "—"}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Pincode</dt>
                <dd className="mt-1 text-slate-800">{user.pincode || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Profile image</dt>
                <dd className="mt-1 break-all text-slate-800">{user.profileImage || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created</dt>
                <dd className="mt-1 text-slate-800">{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Updated</dt>
                <dd className="mt-1 text-slate-800">{formatDate(user.updatedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created by</dt>
                <dd className="mt-1 text-slate-800">
                  {user.createdBy && typeof user.createdBy === "object"
                    ? user.createdBy.name || user.createdBy.email || user.createdBy.username || "—"
                    : "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No user loaded.</p>
          )}
        </div>
      </aside>
    </>
  );
}
