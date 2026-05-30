import { useEffect, useState } from "react";
import { Store, MapPin, Phone, Percent, RefreshCw, User } from "lucide-react";
import { getMyProfile } from "../services/franchise.api.js";

export default function Profile() {
  const [franchise, setFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  })();

  useEffect(() => {
    getMyProfile()
      .then(setFranchise)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="content-shell p-6 flex items-center justify-center py-24 text-slate-400">
      <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading profile...
    </div>
  );

  return (
    <div className="content-shell p-6 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Your franchise and account details</p>
      </div>

      {/* User card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user.name?.charAt(0)?.toUpperCase() ?? "F"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Franchise</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 mb-1">Username</p>
            <p className="text-slate-700 font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Role</p>
            <p className="text-slate-700 font-medium capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Franchise card */}
      {error ? (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
          <Store className="w-10 h-10 text-orange-300 mx-auto mb-3" />
          <p className="font-medium text-orange-700">No Franchise Linked</p>
          <p className="text-sm text-orange-500 mt-1">{error}</p>
          <p className="text-xs text-orange-400 mt-2">Ask your admin to link your account to a franchise</p>
        </div>
      ) : franchise ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-500" /> Franchise Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Store className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="font-semibold text-slate-800">{franchise.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Location</p>
                <p className="text-slate-700">{franchise.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Contact</p>
                <p className="text-slate-700">{franchise.contact}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Percent className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Commission Rate</p>
                <p className="font-bold text-green-700">{franchise.commissionPercent}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-2 h-2 rounded-full ${franchise.isActive ? "bg-green-500" : "bg-slate-300"}`} />
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <p className={`font-medium ${franchise.isActive ? "text-green-600" : "text-slate-500"}`}>
                  {franchise.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}