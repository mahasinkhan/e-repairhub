import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteUser,
  getUserById,
  getUsers,
  updateUserStatus,
} from "../../services/user.service.js";
import AddUserModal from "./AddUserModal.jsx";
import EditUserModal from "./EditUserModal.jsx";
import UserDetailsDrawer from "./UserDetailsDrawer.jsx";
import UserFilters from "./UserFilters.jsx";
import UserTable from "./UserTable.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUserRow, setDeleteUserRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        page,
        limit,
        role: role || undefined,
        status,
        search: search || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setUsers(data.users || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, limit, role, status, search]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function openDrawer(u) {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerUser(null);
    try {
      const full = await getUserById(u.id);
      setDrawerUser(full);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load user");
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  }

  async function handleToggle(u) {
    try {
      await updateUserStatus(u.id, !u.isActive);
      toast.success(u.isActive ? "User deactivated" : "User activated");
      loadUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function confirmDelete() {
    if (!deleteUserRow) return;
    try {
      await deleteUser(deleteUserRow.id);
      toast.success("User deactivated (soft delete)");
      setDeleteUserRow(null);
      loadUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Users</h1>
      </div>

      <UserFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        role={role}
        onRoleChange={(v) => {
          setRole(v);
          setPage(1);
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        onAddClick={() => setAddOpen(true)}
      />

      <UserTable
        users={users}
        loading={loading}
        onView={openDrawer}
        onEdit={(u) => setEditUser(u)}
        onDelete={(u) => setDeleteUserRow(u)}
        onToggleActive={handleToggle}
      />

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row">
        <p>
          Showing <span className="font-medium text-slate-900">{users.length}</span> of{" "}
          <span className="font-medium text-slate-900">{total}</span> users
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-slate-500">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          toast.success("User created");
          loadUsers();
        }}
      />

      <EditUserModal
        open={Boolean(editUser)}
        user={editUser}
        onClose={() => setEditUser(null)}
        onSuccess={() => {
          toast.success("User updated");
          loadUsers();
        }}
      />

      <UserDetailsDrawer
        open={drawerOpen}
        user={drawerUser}
        loading={drawerLoading}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerUser(null);
        }}
      />

      {deleteUserRow ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close"
            onClick={() => setDeleteUserRow(null)}
          />
          <div className="relative max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Deactivate user?</h3>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-800">{deleteUserRow.name}</span> will be
              marked inactive (soft delete). They will not be able to sign in.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteUserRow(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
