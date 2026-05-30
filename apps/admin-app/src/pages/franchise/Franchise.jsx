import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, RefreshCw, Store } from "lucide-react";
import { toast } from "sonner";
import { useFranchiseStore } from "../../features/franchise/franchise.store.js";

const MOCK_FRANCHISES = [
  { _id: "mock_f1", isMock: true, name: "Delhi Central", location: "Connaught Place, Delhi", contact: "9876543210", commissionPercent: 15, isActive: true },
  { _id: "mock_f2", isMock: true, name: "Mumbai West", location: "Bandra, Mumbai", contact: "9876543211", commissionPercent: 12, isActive: true },
  { _id: "mock_f3", isMock: true, name: "Bangalore Tech", location: "Koramangala, Bangalore", contact: "9876543212", commissionPercent: 14, isActive: false },
  { _id: "mock_f4", isMock: true, name: "Chennai Hub", location: "T. Nagar, Chennai", contact: "9876543213", commissionPercent: 13, isActive: true },
];

const EMPTY_FORM = {
  name: "",
  location: "",
  contact: "",
  commissionPercent: "",
  isActive: true,
};

export default function Franchise() {
  const { franchises, loading, fetchFranchises, addFranchise, editFranchise, toggleStatus, removeFranchise } = useFranchiseStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchFranchises();
  }, []);

  const displayList = franchises.length > 0 ? franchises : MOCK_FRANCHISES;

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (franchise) => {
    if (franchise.isMock) {
      toast.info("Sample data — add a real franchise first.");
      return;
    }
    setForm({
      name: franchise.name ?? "",
      location: franchise.location ?? "",
      contact: franchise.contact ?? "",
      commissionPercent: franchise.commissionPercent ?? "",
      isActive: franchise.isActive ?? true,
    });
    setEditingId(franchise._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Franchise name is required");
    if (!form.location.trim()) return toast.error("Location is required");
    if (!form.contact.trim()) return toast.error("Contact is required");

    setSaving(true);
    try {
      if (editingId) {
        await editFranchise(editingId, form);
        toast.success("Franchise updated");
      } else {
        await addFranchise(form);
        toast.success("Franchise added");
      }
      closeModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (franchise) => {
    if (franchise.isMock) {
      toast.info("Sample data — add a real franchise to toggle status.");
      return;
    }
    try {
      await toggleStatus(franchise._id, !franchise.isActive);
      toast.success(`Franchise ${franchise.isActive ? "deactivated" : "activated"}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    const franchise = displayList.find((f) => f._id === id);
    if (franchise?.isMock) {
      toast.info("Cannot delete sample data.");
      return;
    }
    if (!window.confirm("Delete this franchise? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await removeFranchise(id);
      toast.success("Franchise deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Franchise Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your repair franchise network</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchFranchises()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Franchise
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Store className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No franchises found</p>
            <button onClick={openAdd} className="mt-3 text-orange-500 text-sm font-medium hover:underline">
              Add your first franchise
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Franchise Name", "Location", "Contact", "Commission %", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayList.map((franchise) => (
                  <tr key={franchise._id} className={`hover:bg-slate-50 transition ${franchise.isMock ? "opacity-70" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Store className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">{franchise.name}</span>
                          {franchise.isMock && (
                            <span className="ml-2 text-xs text-orange-400 font-normal">(sample)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{franchise.location ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-600">{franchise.contact ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{franchise.commissionPercent ?? "—"}%</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        franchise.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {franchise.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(franchise)}
                          title={franchise.isActive ? "Deactivate" : "Activate"}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                        >
                          {franchise.isActive
                            ? <ToggleRight className="w-5 h-5 text-green-500" />
                            : <ToggleLeft className="w-5 h-5" />
                          }
                        </button>
                        <button
                          onClick={() => openEdit(franchise)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-blue-500"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(franchise._id)}
                          disabled={deletingId === franchise._id}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 transition text-slate-400 hover:text-red-500 disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                {franchises.length > 0
                  ? `${franchises.length} franchise${franchises.length !== 1 ? "s" : ""}`
                  : <span>Showing sample data — <button onClick={openAdd} className="text-orange-500 hover:underline">add a real franchise</button></span>
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">
                {editingId ? "Edit Franchise" : "Add Franchise"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Franchise Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Delhi Central"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Location *</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Connaught Place, Delhi"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Contact *</label>
                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Phone number or email"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Commission %</label>
                <input
                  name="commissionPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={form.commissionPercent}
                  onChange={handleChange}
                  placeholder="e.g. 15"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-600">Active</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg py-2.5 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Add Franchise"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}